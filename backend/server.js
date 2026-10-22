import http from 'node:http';
import { URL } from 'node:url';
import { CONFIG } from './config.js';
import { db, logSecurityEvent } from './db/database.js';
import {
  encryptPII,
  decryptPII,
  createBlindHash,
  maskCardNumber,
  generateSecureProtocol,
  verifySecretTimingSafe,
} from './security/crypto.js';
import { sanitizeString, validateOrderPayload } from './security/validator.js';
import {
  applySecurityHeaders,
  checkRateLimit,
  parseSafeJsonBody,
} from './security/middleware.js';

// Prepared Statements parametrizados (Anti-SQL Injection)
const selectActiveProductsStmt = db.prepare(`
  SELECT id, type, name, style, category, abv, ibu, ebc, volume, price,
         original_price, batch, stock, image, short_desc, hops_json,
         malts_json, temp, glass, pairing_json
  FROM products
  WHERE active = 1
`);

const selectProductByIdStmt = db.prepare(`
  SELECT id, name, style, price, stock, active
  FROM products
  WHERE id = ?
`);

const decrementStockStmt = db.prepare(`
  UPDATE products
  SET stock = stock - ?, updated_at = datetime('now')
  WHERE id = ? AND stock >= ?
`);

const insertOrderStmt = db.prepare(`
  INSERT INTO orders (
    protocol, customer_name_enc, customer_phone_enc, customer_phone_hash,
    shipping_address_enc, cep_masked, delivery_method, payment_method,
    card_masked, subtotal, shipping_cost, discount, total, status, client_ip_hash
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)
`);

const insertOrderItemStmt = db.prepare(`
  INSERT INTO order_items (
    order_id, product_id, product_name, qty, unit_price, line_total
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

const selectOrderByProtocolStmt = db.prepare(`
  SELECT id, protocol, customer_name_enc, cep_masked, delivery_method,
         payment_method, card_masked, subtotal, shipping_cost, discount,
         total, status, created_at
  FROM orders
  WHERE protocol = ?
`);

const selectOrderItemsStmt = db.prepare(`
  SELECT product_id, product_name, qty, unit_price, line_total
  FROM order_items
  WHERE order_id = ?
`);

const countOrdersStmt = db.prepare(`SELECT COUNT(*) AS total FROM orders`);
const recentAuditStmt = db.prepare(`
  SELECT id, event_type, severity, created_at
  FROM security_audit_logs
  ORDER BY id DESC
  LIMIT 10
`);

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Prevenção contra IP Spoofing via X-Forwarded-For (SEC-01):
  // Apenas confia em X-Forwarded-For se TRUST_PROXY=true estiver explicitamente configurado
  const clientIp =
    (CONFIG.TRUST_PROXY && req.headers['x-forwarded-for']?.split(',')[0]?.trim()) ||
    req.socket.remoteAddress ||
    'unknown';

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Rate Limiting Global por IP
  const generalLimit = checkRateLimit(clientIp, 'general', 90, 60_000);
  if (!generalLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', 'WARN', generalLimit.ipHash, {
      path: pathname,
    });
    sendJson(res, 429, {
      error: 'Muitas requisições. Aguarde alguns segundos antes de tentar novamente.',
      retryAfter: generalLimit.retryAfterSeconds,
    });
    return;
  }

  try {
    // ROTA 1: Health & Security Status (/api/health)
    if (req.method === 'GET' && pathname === '/api/health') {
      const orderStats = countOrdersStmt.get();
      sendJson(res, 200, {
        status: 'ok',
        service: 'Gralha Brewing Co. Secure Backend',
        database: 'SQLite 3 (WAL + Secure Delete + Foreign Keys)',
        securityControls: {
          encryptionAtRest: 'AES-256-GCM (NIST 96-bit IV + Explicit 128-bit AuthTag)',
          blindIndexing: 'HMAC-SHA256',
          sqlInjectionProtection: '100% Parameterized Prepared Statements',
          priceCalculation: 'Server-Side Authoritative (Anti-Tampering)',
          pciCompliance: 'Client-Side Truncation + Zero Raw PAN/CVV Transit or Persistence',
          rateLimiting: 'Bounded Sliding Window per Verified Socket IP',
          headers: 'CSP, HSTS, X-Frame-Options DENY, NoSniff',
        },
        metrics: {
          encryptedOrdersCount: orderStats?.total || 0,
        },
      });
      return;
    }

    // ROTA 2: Catálogo Oficial de Produtos (/api/products)
    if (req.method === 'GET' && pathname === '/api/products') {
      const rows = selectActiveProductsStmt.all();
      const beers = [];
      const packs = [];

      for (const row of rows) {
        const formatted = {
          id: row.id,
          name: row.name,
          style: row.style,
          category: row.category,
          abv: row.abv,
          ibu: row.ibu,
          ebc: row.ebc,
          volume: row.volume,
          price: row.price,
          originalPrice: row.original_price,
          batch: row.batch,
          stock: row.stock,
          image: row.image,
          shortDesc: row.short_desc,
          description: row.short_desc,
          hops: JSON.parse(row.hops_json || '[]'),
          malts: JSON.parse(row.malts_json || '[]'),
          temp: row.temp,
          glass: row.glass,
          pairing: JSON.parse(row.pairing_json || '[]'),
        };

        if (row.type === 'pack') {
          packs.push(formatted);
        } else {
          beers.push(formatted);
        }
      }

      sendJson(res, 200, { beers, packs });
      return;
    }

    // ROTA 3: Criação Segura de Pedido (/api/orders)
    if (req.method === 'POST' && pathname === '/api/orders') {
      // Rate limit mais restrito para checkout (máx 12 tentativas a cada 15 min por IP)
      const orderLimit = checkRateLimit(clientIp, 'checkout', 12, 15 * 60_000);
      if (!orderLimit.allowed) {
        logSecurityEvent('CHECKOUT_RATE_LIMIT', 'WARN', orderLimit.ipHash, {
          message: 'Excesso de tentativas no checkout',
        });
        sendJson(res, 429, {
          error: 'Limite de tentativas de pedido excedido. Aguarde alguns minutos.',
        });
        return;
      }

      const body = await parseSafeJsonBody(req);
      const validation = validateOrderPayload(body);

      if (!validation.valid) {
        logSecurityEvent('INVALID_ORDER_PAYLOAD', 'WARN', orderLimit.ipHash, {
          errors: validation.errors,
        });
        sendJson(res, 400, {
          error: validation.errors[0],
          details: validation.errors,
        });
        return;
      }

      const {
        items,
        customer,
        deliveryMethod,
        paymentMethod,
        cardLast4,
        shipping,
      } = validation.sanitized;

      // Transação Atômica no SQLite: Valida estoque e calcula preço NO SERVIDOR
      db.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        let serverSubtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
          const dbProduct = selectProductByIdStmt.get(item.id);
          if (!dbProduct || !dbProduct.active) {
            throw new Error(`Produto não encontrado ou indisponível: ${item.id}`);
          }
          if (dbProduct.stock < item.qty) {
            throw new Error(
              `Estoque insuficiente para ${dbProduct.name} (disponível: ${dbProduct.stock}).`
            );
          }

          const lineTotal = Number((dbProduct.price * item.qty).toFixed(2));
          serverSubtotal = Number((serverSubtotal + lineTotal).toFixed(2));

          verifiedItems.push({
            id: dbProduct.id,
            name: dbProduct.name,
            qty: item.qty,
            unitPrice: dbProduct.price,
            lineTotal,
          });
        }

        // Cálculo de frete e desconto PIX 100% no servidor
        const isFreeShipping = serverSubtotal >= 120;
        const serverShippingCost =
          deliveryMethod === 'pickup'
            ? 0
            : isFreeShipping
            ? 0
            : deliveryMethod === 'express-cwb'
            ? 12.9
            : 22.0;

        const serverDiscount =
          paymentMethod === 'pix'
            ? Number((serverSubtotal * 0.05).toFixed(2))
            : 0;

        const serverTotal = Number(
          Math.max(0, serverSubtotal - serverDiscount + serverShippingCost).toFixed(2)
        );

        // Criptografia de Dados Pessoais (AES-256-GCM - Conformidade LGPD)
        const customerNameEnc = encryptPII(customer.name);
        const customerPhoneEnc = encryptPII(customer.phone);
        const customerPhoneHash = createBlindHash(customer.phone);

        const fullAddressPlain = `${shipping.street}, ${shipping.number} ${shipping.complement} - ${shipping.neighborhood}, ${shipping.city}/${shipping.uf} (CEP: ${shipping.cep})`;
        const shippingAddressEnc = encryptPII(fullAddressPlain);
        const cepMasked =
          shipping.cep.length === 8
            ? `${shipping.cep.slice(0, 5)}-***`
            : 'Curitiba-PR';

        const cardMasked =
          paymentMethod === 'card' ? maskCardNumber(cardLast4) : null;

        const protocol = generateSecureProtocol();

        const orderResult = insertOrderStmt.run(
          protocol,
          customerNameEnc,
          customerPhoneEnc,
          customerPhoneHash,
          shippingAddressEnc,
          cepMasked,
          deliveryMethod,
          paymentMethod,
          cardMasked,
          serverSubtotal,
          serverShippingCost,
          serverDiscount,
          serverTotal,
          orderLimit.ipHash
        );

        const orderId = orderResult.lastInsertRowid;

        for (const vItem of verifiedItems) {
          insertOrderItemStmt.run(
            orderId,
            vItem.id,
            vItem.name,
            vItem.qty,
            vItem.unitPrice,
            vItem.lineTotal
          );

          const stockResult = decrementStockStmt.run(
            vItem.qty,
            vItem.id,
            vItem.qty
          );
          if (stockResult.changes === 0) {
            throw new Error(`Falha ao reservar estoque para ${vItem.name}.`);
          }
        }

        db.exec('COMMIT');

        logSecurityEvent('ORDER_CREATED_SECURELY', 'INFO', orderLimit.ipHash, {
          protocol,
          itemsCount: verifiedItems.length,
          paymentMethod,
        });

        sendJson(res, 201, {
          protocol,
          status: 'CONFIRMED',
          customerFirstName: customer.name.split(' ')[0],
          paymentMethod,
          deliveryMethod,
          subtotal: serverSubtotal,
          shippingCost: serverShippingCost,
          discount: serverDiscount,
          total: serverTotal,
          securityBadge: 'AES-256-GCM Encrypted & Server-Verified',
        });
        return;
      } catch (txErr) {
        db.exec('ROLLBACK');
        logSecurityEvent('ORDER_TRANSACTION_REJECTED', 'WARN', orderLimit.ipHash, {
          reason: txErr.message,
        });
        sendJson(res, 400, { error: txErr.message });
        return;
      }
    }

    // ROTA 4: Consulta Segura de Pedido por Protocolo (/api/orders/:protocol)
    if (req.method === 'GET' && pathname.startsWith('/api/orders/')) {
      // Rate limit dedicado contra enumeração de protocolos (IDOR)
      const lookupLimit = checkRateLimit(clientIp, 'order_lookup', 15, 15 * 60_000);
      if (!lookupLimit.allowed) {
        logSecurityEvent('ORDER_LOOKUP_RATE_LIMIT', 'WARN', lookupLimit.ipHash, {
          path: pathname,
        });
        sendJson(res, 429, {
          error: 'Limite de consultas de protocolo excedido. Aguarde alguns minutos.',
        });
        return;
      }

      const rawProtocol = sanitizeString(pathname.replace('/api/orders/', ''), 20).toUpperCase();
      if (!/^GRB-[A-Z0-9]{6,12}$/.test(rawProtocol)) {
        sendJson(res, 400, { error: 'Formato de protocolo inválido.' });
        return;
      }

      const order = selectOrderByProtocolStmt.get(rawProtocol);
      if (!order) {
        sendJson(res, 404, { error: 'Pedido não encontrado.' });
        return;
      }

      const items = selectOrderItemsStmt.all(order.id);
      const decryptedName = decryptPII(order.customer_name_enc);
      const firstNameOnly = decryptedName ? decryptedName.split(' ')[0] : 'Cliente';

      sendJson(res, 200, {
        protocol: order.protocol,
        customerFirstName: firstNameOnly,
        cepMasked: order.cep_masked,
        deliveryMethod: order.delivery_method,
        paymentMethod: order.payment_method,
        cardMasked: order.card_masked,
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        discount: order.discount,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        items,
      });
      return;
    }

    // ROTA 5: Auditoria Administrativa Protegida por Token Timing-Safe (/api/admin/audit)
    if (req.method === 'GET' && pathname === '/api/admin/audit') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (!verifySecretTimingSafe(token, CONFIG.ADMIN_TOKEN)) {
        logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', 'CRITICAL', generalLimit.ipHash, {
          path: pathname,
        });
        sendJson(res, 401, { error: 'Acesso não autorizado.' });
        return;
      }

      const logs = recentAuditStmt.all();
      sendJson(res, 200, { auditLogs: logs });
      return;
    }

    sendJson(res, 404, { error: 'Rota não encontrada.' });
  } catch (err) {
    if (err.message === 'PAYLOAD_TOO_LARGE') {
      logSecurityEvent('PAYLOAD_DOS_BLOCKED', 'CRITICAL', generalLimit.ipHash, {
        path: pathname,
      });
      sendJson(res, 413, { error: 'Payload excede o limite de segurança (16KB).' });
      return;
    }
    if (err.message === 'PROTOTYPE_POLLUTION_DETECTED') {
      logSecurityEvent('PROTOTYPE_POLLUTION_ATTEMPT', 'CRITICAL', generalLimit.ipHash, {
        path: pathname,
      });
      sendJson(res, 400, { error: 'Estrutura JSON bloqueada por segurança.' });
      return;
    }
    if (err.message === 'INVALID_JSON') {
      sendJson(res, 400, { error: 'JSON malformado.' });
      return;
    }

    console.error('[Internal Server Error]', err);
    sendJson(res, 500, {
      error: 'Erro interno no servidor.',
    });
  }
});

server.listen(CONFIG.PORT, '127.0.0.1', () => {
  console.log(
    `[Gralha Security Backend] Servidor ativo em http://127.0.0.1:${CONFIG.PORT} (SQLite WAL + AES-256-GCM)`
  );
});
