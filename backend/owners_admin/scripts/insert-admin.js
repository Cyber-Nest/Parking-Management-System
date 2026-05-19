/**
 * Insert default owner admin into admins table.
 * Usage: node scripts/insert-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

const ADMIN_EMAIL = 'admin@parksmart.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'John Doe';

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
  });

  const [[role]] = await conn.query(
    `SELECT id FROM roles WHERE name = 'owner' LIMIT 1`,
  );
  if (!role?.id) {
    console.error('Owner role not found. Run: npm run db:init');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const adminId = randomUUID();

  const [result] = await conn.query(
    `INSERT INTO admins (id, email, password_hash, full_name, role_id, is_active)
     VALUES (?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       full_name = VALUES(full_name),
       role_id = VALUES(role_id),
       is_active = 1`,
    [adminId, ADMIN_EMAIL.toLowerCase(), passwordHash, ADMIN_NAME, role.id],
  );

  const [[row]] = await conn.query(
    `SELECT id, email, full_name, is_active FROM admins WHERE email = ?`,
    [ADMIN_EMAIL.toLowerCase()],
  );

  await conn.end();

  console.log('\nAdmin ready for login:\n');
  console.log('  ID       :', row.id);
  console.log('  Email    :', row.email);
  console.log('  Password :', ADMIN_PASSWORD);
  console.log('  Name     :', row.full_name);
  console.log('\nLogin at: http://localhost:3000/login (or :3001)\n');
})().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
