import crypto from 'node:crypto';
import { CONFIG } from '../config.js';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit IV recomendado pelo NIST SP 800-38D para GCM
const AUTH_TAG_BYTES = 16; // 128-bit Authentication Tag explícito (anti-tag truncation)
const KEY_BUFFER = Buffer.from(CONFIG.AES_KEY_HEX, 'hex');

/**
 * Criptografa dados pessoais sensíveis (PII - LGPD) com AES-256-GCM autenticado.
 * Formato salvo no banco: ivHex:authTagHex:cipherTextHex
 */
export function encryptPII(plainText) {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });

  const encrypted = Buffer.concat([
    cipher.update(String(plainText), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Descriptografa dados pessoais autenticando a integridade via AuthTag (GCM).
 * Se qualquer byte no banco SQLite for adulterado ou truncado, lança erro de integridade.
 */
export function decryptPII(payload) {
  if (!payload || typeof payload !== 'string' || !payload.includes(':')) {
    return '';
  }
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('INVALID_CIPHERTEXT_FORMAT');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) {
    throw new Error('INVALID_GCM_IV_OR_TAG_LENGTH');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Gera um hash HMAC-SHA256 determinístico (Blind Index) para indexar/buscar
 * dados (ex: IP anonimizado ou telefone) sem salvar o texto puro no banco.
 */
export function createBlindHash(value) {
  if (!value) return '';
  return crypto
    .createHmac('sha256', CONFIG.HMAC_SECRET)
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

/**
 * Comparação em tempo constante (Timing-Safe) para evitar ataques de Side-Channel.
 */
export function verifySecretTimingSafe(provided, expected) {
  if (!provided || !expected) return false;
  const bufA = Buffer.from(String(provided));
  const bufB = Buffer.from(String(expected));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Mascara dados de cartão (PCI-DSS): nunca armazena os dígitos centrais ou CVV.
 */
export function maskCardNumber(rawCardNumber) {
  if (!rawCardNumber) return null;
  const digits = String(rawCardNumber).replace(/\D/g, '');
  if (digits.length < 4) return '****';
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Gera um protocolo de pedido criptograficamente seguro de alta entropia (GRB-XXXXXXXXXX)
 * com 50 bits de entropia (Base32 Crockford sem caracteres ambíguos), prevenindo enumeração (IDOR).
 */
const PROTOCOL_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function generateSecureProtocol() {
  const bytes = crypto.randomBytes(10);
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += PROTOCOL_ALPHABET[bytes[i] % PROTOCOL_ALPHABET.length];
  }
  return `GRB-${code}`;
}
