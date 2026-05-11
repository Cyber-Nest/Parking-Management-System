require('dotenv').config();
const mysql = require('mysql2/promise');

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
    multipleStatements: true,
  });

  const [cols] = await conn.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'officers'`
  );
  const colSet = new Set(cols.map((c) => c.COLUMN_NAME));

  if (!colSet.has('role')) {
    await conn.query(`ALTER TABLE officers ADD COLUMN role ENUM('OFFICER','SUPERVISOR') NOT NULL DEFAULT 'OFFICER' AFTER badge_number`);
    await conn.query(`UPDATE officers SET role = 'OFFICER' WHERE role IS NULL OR role = ''`);
    console.log('[DB MIGRATE] Added officers.role');
  } else {
    console.log('[DB MIGRATE] officers.role already exists');
  }

  await conn.end();
};

run().catch((err) => {
  console.error('[DB MIGRATE] Failed:', err.message || err);
  process.exit(1);
});

