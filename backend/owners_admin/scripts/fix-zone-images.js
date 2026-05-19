/**
 * Fix broken Unsplash URLs in parking_zones (from old seed template).
 * Usage: node scripts/fix-zone-images.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const VALID_IMAGES = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1449965405289-9ebbf974f6cc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590674899484-d5640e742f00?auto=format&fit=crop&w=1200&q=80',
];

const isBroken = (url) =>
  !url ||
  url.includes('1510000000000') ||
  /photo-15\d{10,}000000000/i.test(url);

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
  });

  const [rows] = await conn.query('SELECT id, image_url FROM parking_zones');
  let fixed = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!isBroken(row.image_url)) continue;

    const imageUrl = VALID_IMAGES[i % VALID_IMAGES.length];
    await conn.query('UPDATE parking_zones SET image_url = ? WHERE id = ?', [imageUrl, row.id]);
    fixed += 1;
    console.log(`Fixed ${row.id}`);
  }

  await conn.end();
  console.log(`Done. Updated ${fixed} zone image(s).`);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
