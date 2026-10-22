/**
 * Sanitizador e Validador Estrito de Dados (Prevenção contra XSS, Injection e Prototype Pollution)
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
];

/**
 * Remove tags HTML, caracteres de controle e vetores de XSS de qualquer string.
 */
export function sanitizeString(input, maxLength = 150) {
  if (typeof input !== 'string') return '';
  let clean = input.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Remove tags HTML (< e >) e caracteres de controle ASCII
  clean = clean
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '');

  return clean.slice(0, maxLength);
}

/**
 * Valida o payload de criação de pedido contra adulteração de preços,
 * quantidades negativas/excessivas e campos inválidos.
 */
export function validateOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: ['Payload JSON inválido.'] };
  }

  // 1. Validar Itens do Pedido (Apenas ID e Quantidade são aceitos; preços do cliente são ignorados!)
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('A sacola de compras não pode estar vazia.');
  } else if (payload.items.length > 25) {
    errors.push('Número máximo de tipos de itens excedido.');
  }

  const sanitizedItemsMap = new Map();
  if (Array.isArray(payload.items)) {
    for (const item of payload.items) {
      const id = sanitizeString(item?.id, 60);
      const qty = Number(item?.qty);

      if (!id || !/^[a-z0-9-]+$/.test(id)) {
        errors.push(`Identificador de produto inválido: ${id || 'vazio'}`);
        continue;
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        errors.push(`Quantidade inválida para o item ${id} (permitido: 1 a 50).`);
        continue;
      }

      const accumulatedQty = (sanitizedItemsMap.get(id) || 0) + qty;
      if (accumulatedQty > 50) {
        errors.push(`Quantidade total máxima excedida para o item ${id} (máximo: 50).`);
        continue;
      }
      sanitizedItemsMap.set(id, accumulatedQty);
    }
  }
  const sanitizedItems = Array.from(sanitizedItemsMap, ([id, qty]) => ({ id, qty }));

  // 2. Validar Dados do Cliente
  const customerName = sanitizeString(payload.customer?.name, 100);
  const customerPhone = sanitizeString(payload.customer?.phone, 25);

  if (customerName.length < 2) {
    errors.push('Informe um nome válido (mínimo 2 caracteres).');
  }
  if (!/^[0-9()\-\s+]{8,22}$/.test(customerPhone)) {
    errors.push('Informe um telefone/WhatsApp válido.');
  }

  // 3. Validar Método de Entrega e Endereço
  const allowedDelivery = ['express-cwb', 'pickup', 'carrier'];
  const deliveryMethod = sanitizeString(payload.deliveryMethod, 20);
  if (!allowedDelivery.includes(deliveryMethod)) {
    errors.push('Método de entrega inválido.');
  }

  const cep = sanitizeString(payload.shipping?.cep, 12).replace(/\D/g, '');
  const street = sanitizeString(payload.shipping?.street || 'Curitiba', 140);
  const number = sanitizeString(payload.shipping?.number || 'S/N', 20);
  const complement = sanitizeString(payload.shipping?.complement || '', 80);
  const neighborhood = sanitizeString(payload.shipping?.neighborhood || '', 80);
  const city = sanitizeString(payload.shipping?.city || 'Curitiba', 60);
  const uf = sanitizeString(payload.shipping?.uf || 'PR', 2).toUpperCase();

  if (deliveryMethod !== 'pickup' && cep.length !== 8) {
    errors.push('CEP válido de 8 dígitos é obrigatório para entrega.');
  }

  // 4. Validar Método de Pagamento
  const allowedPayment = ['pix', 'card'];
  const paymentMethod = sanitizeString(payload.paymentMethod, 15);
  if (!allowedPayment.includes(paymentMethod)) {
    errors.push('Método de pagamento inválido.');
  }

  let cardLast4 = null;
  if (paymentMethod === 'card') {
    // PCI-DSS Hardening: rejeita envio do PAN completo ao servidor próprio; aceita apenas os 4 dígitos finais já truncados/tokenizados no cliente
    if (payload.card?.number && String(payload.card.number).replace(/\D/g, '').length > 4) {
      errors.push('Por segurança (PCI-DSS), nunca envie o número completo do cartão ao servidor.');
    }
    const rawLast4 = String(payload.card?.last4 || payload.card?.number || '').replace(/\D/g, '');
    if (rawLast4.length !== 4) {
      errors.push('Identificação de cartão inválida (informe os 4 dígitos finais).');
    } else {
      cardLast4 = rawLast4;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      items: sanitizedItems,
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      deliveryMethod,
      paymentMethod,
      cardLast4,
      shipping: {
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        uf,
      },
    },
  };
}
