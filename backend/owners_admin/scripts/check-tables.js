require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
  });
  for (const table of ['bookings', 'transactions', 'invoices']) {
    const [rows] = await c.query('SHOW TABLES LIKE ?', [table]);
    const exists = rows.length > 0;
    let count = 0;
    if (exists) {
      const [crows] = await c.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
      count = crows[0].n;
    }
    console.log(`${table}: ${exists ? `yes (${count} rows)` : 'MISSING'}`);
  }
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
