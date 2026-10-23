import { CONFIG } from '../config.js';
import { createBlindHash } from './crypto.js';

/**
 * Rate Limiter em memória (Janela Deslizante por IP Anonimizado via HMAC)
 * Protege contra ataques de Força Bruta, DDoS de camada 7 e abuso de criação de pedidos.
 */
const rateLimitBuckets = new Map();

// Limpeza periódica de buckets expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now > bucket.resetAt) {
      rateLimitBuckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function checkRateLimit(ipAddress, routeGroup = 'general', maxRequests = 80, windowMs = 60_000) {
  const now = Date.now();
  const ipHash = createBlindHash(ipAddress || 'unknown');
  const key = `${routeGroup}:${ipHash}`;

  let bucket = rateLimitBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    // Prevenção contra exaustão de memória (Eviction FIFO caso exceda MAX_RATE_LIMIT_BUCKETS)
    if (!bucket && rateLimitBuckets.size >= (CONFIG.MAX_RATE_LIMIT_BUCKETS || 5000)) {
      const oldestKey = rateLimitBuckets.keys().next().value;
      if (oldestKey) rateLimitBuckets.delete(oldestKey);
    }
    bucket = { count: 1, resetAt: now + windowMs, ipHash };
    rateLimitBuckets.set(key, bucket);
    return { allowed: true, remaining: maxRequests - 1, ipHash };
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      ipHash,
    };
  }

  return { allowed: true, remaining: maxRequests - bucket.count, ipHash };
}

/**
 * Aplica cabeçalhos HTTP de segurança padrão OWASP / Helmet
 */
export function applySecurityHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', CONFIG.ALLOWED_ORIGINS[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gralha-Client');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OWASP Security Hardening Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
  );
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
}

const FORBIDDEN_JSON_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function containsForbiddenKeysDeep(obj, depth = 0) {
  if (depth > 8 || !obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_JSON_KEYS.has(key)) return true;
    if (containsForbiddenKeysDeep(obj[key], depth + 1)) return true;
  }
  return false;
}

/**
 * Lê o corpo JSON da requisição com limite estrito de bytes (Anti-DoS / Memory Exhaustion),
 * concatenação segura de Buffers UTF-8 multi-byte e inspeção recursiva contra Prototype Pollution.
 */
export function parseSafeJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytesRead = 0;

    req.on('data', (chunk) => {
      bytesRead += chunk.length;
      if (bytesRead > CONFIG.MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      const rawBody = Buffer.concat(chunks).toString('utf8');
      if (
        rawBody.includes('"__proto__"') ||
        rawBody.includes('"constructor"') ||
        rawBody.includes('"prototype"')
      ) {
        reject(new Error('PROTOTYPE_POLLUTION_DETECTED'));
        return;
      }
      try {
        const parsed = JSON.parse(rawBody);
        if (containsForbiddenKeysDeep(parsed)) {
          reject(new Error('PROTOTYPE_POLLUTION_DETECTED'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}
