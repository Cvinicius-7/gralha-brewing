import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { CONFIG } from '../config.js';
import { BEERS_CATALOG, CURATED_PACKS } from '../../src/data/beers.js';

// Garantir que o diretório de dados exista com permissões restritas
const dataDir = path.dirname(CONFIG.DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
}

export const db = new DatabaseSync(CONFIG.DB_PATH);

/**
 * Inicialização endurecida (Hardened SQLite)
 * - journal_mode = WAL (Alta concorrência e integridade contra corrupção)
 * - foreign_keys = ON (Integridade referencial estrita)
 * - secure_delete = ON (Sobrescreve dados deletados com zeros no disco físico - LGPD)
 */
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA secure_delete = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('beer', 'pack')),
    name TEXT NOT NULL,
    style TEXT NOT NULL,
    category TEXT NOT NULL,
    abv TEXT,
    ibu INTEGER,
    ebc INTEGER,
    volume TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    original_price REAL,
    batch TEXT,
    stock INTEGER NOT NULL DEFAULT 48 CHECK(stock >= 0),
    image TEXT,
    short_desc TEXT,
    hops_json TEXT,
    malts_json TEXT,
    temp TEXT,
    glass TEXT,
    pairing_json TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocol TEXT NOT NULL UNIQUE,
    customer_name_enc TEXT NOT NULL,
    customer_phone_enc TEXT NOT NULL,
    customer_phone_hash TEXT NOT NULL,
    shipping_address_enc TEXT NOT NULL,
    cep_masked TEXT NOT NULL,
    delivery_method TEXT NOT NULL CHECK(delivery_method IN ('express-cwb', 'pickup', 'carrier')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('pix', 'card')),
    card_masked TEXT,
    subtotal REAL NOT NULL CHECK(subtotal >= 0),
    shipping_cost REAL NOT NULL CHECK(shipping_cost >= 0),
    discount REAL NOT NULL CHECK(discount >= 0),
    total REAL NOT NULL CHECK(total >= 0),
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    client_ip_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK(qty > 0 AND qty <= 50),
    unit_price REAL NOT NULL CHECK(unit_price >= 0),
    line_total REAL NOT NULL CHECK(line_total >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS security_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('INFO', 'WARN', 'CRITICAL')),
    ip_hash TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/**
 * Prepared Statements parametrizados (100% imunes a SQL Injection)
 */
const insertProductStmt = db.prepare(`
  INSERT OR IGNORE INTO products (
    id, type, name, style, category, abv, ibu, ebc, volume, price, original_price,
    batch, stock, image, short_desc, hops_json, malts_json, temp, glass, pairing_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAuditStmt = db.prepare(`
  INSERT INTO security_audit_logs (event_type, severity, ip_hash, details)
  VALUES (?, ?, ?, ?)
`);

export function logSecurityEvent(eventType, severity, ipHash, details) {
  try {
    insertAuditStmt.run(
      String(eventType).slice(0, 60),
      severity,
      ipHash || 'system',
      typeof details === 'string' ? details.slice(0, 500) : JSON.stringify(details).slice(0, 500)
    );
  } catch (err) {
    console.error('[Security Audit Error]', err.message);
  }
}

/**
 * Popula o banco SQLite com os produtos oficiais da Gralha Brewing Co.
 */
function seedInitialCatalog() {
  db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    for (const beer of BEERS_CATALOG) {
      insertProductStmt.run(
        beer.id,
        'beer',
        beer.name,
        beer.style,
        beer.category,
        beer.abv,
        beer.ibu,
        beer.ebc,
        beer.volume,
        beer.price,
        null,
        beer.batch,
        60,
        beer.image,
        beer.shortDesc,
        JSON.stringify(beer.hops || []),
        JSON.stringify(beer.malts || []),
        beer.temp || '',
        beer.glass || '',
        JSON.stringify(beer.pairing || [])
      );
    }

    for (const pack of CURATED_PACKS) {
      insertProductStmt.run(
        pack.id,
        'pack',
        pack.name,
        pack.style,
        'pack',
        null,
        null,
        null,
        pack.volume,
        pack.price,
        pack.originalPrice,
        'Caixa Selecionada',
        30,
        pack.image,
        pack.description,
        '[]',
        '[]',
        '2°C a 6°C',
        'Diversos',
        '[]'
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

seedInitialCatalog();
