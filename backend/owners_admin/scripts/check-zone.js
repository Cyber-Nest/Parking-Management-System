#!/usr/bin/env node
require('dotenv').config();
const mysql = require('mysql2/promise');

const id = process.argv[2];
if (!id) {
  console.error('Usage: node scripts/check-zone.js ZONE-...');
  process.exit(1);
}

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || undefined,
    });

    const [rows] = await conn.execute('SELECT id, parking_name FROM parking_zones WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) {
      console.log('NOT_FOUND');
    } else {
      console.log(JSON.stringify(rows[0], null, 2));
    }

    await conn.end();
  } catch (err) {
    console.error('ERR', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
})();
