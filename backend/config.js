import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE_PATH = path.join(__dirname, '.env.local');

/**
 * Carrega ou gera chaves criptográficas locais de 256 bits (AES-256-GCM e HMAC-SHA256)
 * armazenadas fora do código-fonte (.env.local ignorado pelo Git).
 */
function loadOrInitializeSecrets() {
  if (fs.existsSync(ENV_FILE_PATH)) {
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  } else {
    const generatedAesKey = crypto.randomBytes(32).toString('hex');
    const generatedHmacSecret = crypto.randomBytes(32).toString('hex');
    const generatedAdminToken = crypto.randomBytes(24).toString('hex');

    const envContent = [
      '# CHAVES CRIPTOGRAFICAS LOCAIS - GRALHA BREWING CO. (NAO COMITAR)',
      `DATA_ENCRYPTION_KEY_HEX=${generatedAesKey}`,
      `HMAC_BLIND_INDEX_SECRET=${generatedHmacSecret}`,
      `ADMIN_API_TOKEN=${generatedAdminToken}`,
      'PORT=3001',
      'ALLOWED_ORIGIN=http://localhost:5173',
      '',
    ].join('\n');

    fs.writeFileSync(ENV_FILE_PATH, envContent, { mode: 0o600 });
    process.env.DATA_ENCRYPTION_KEY_HEX = generatedAesKey;
    process.env.HMAC_BLIND_INDEX_SECRET = generatedHmacSecret;
    process.env.ADMIN_API_TOKEN = generatedAdminToken;
  }
}

loadOrInitializeSecrets();

export const CONFIG = {
  PORT: Number(process.env.PORT || 3001),
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  ALLOWED_ORIGINS: [
    process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  AES_KEY_HEX: process.env.DATA_ENCRYPTION_KEY_HEX,
  HMAC_SECRET: process.env.HMAC_BLIND_INDEX_SECRET,
  ADMIN_TOKEN: process.env.ADMIN_API_TOKEN,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  DB_PATH: path.join(__dirname, 'data', 'gralha_brewing.sqlite'),
  MAX_BODY_BYTES: 16 * 1024, // 16 KB max payload (anti-DoS)
  MAX_RATE_LIMIT_BUCKETS: 5000, // Limite de buckets em memória (anti-Memory Exhaustion)
};
