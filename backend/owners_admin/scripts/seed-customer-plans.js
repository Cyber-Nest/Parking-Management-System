/**
 * Upsert parking plans that match customer duration options (customer.service.ts).
 * Run after db:init — ensures plan_id is set on bookings/sessions.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const CUSTOMER_PLANS = [
  { id: 'c1111111-1111-4111-8111-000000000030', name: '30M', price: 2.5, duration: 30 },
  { id: 'c1111111-1111-4111-8111-000000000060', name: '1H', price: 4.5, duration: 60 },
  { id: 'c1111111-1111-4111-8111-00000000180', name: '3H', price: 12, duration: 180 },
  { id: 'c1111111-1111-4111-8111-00000000300', name: '5H', price: 18, duration: 300 },
  { id: 'c1111111-1111-4111-8111-00000000720', name: 'HALF DAY', price: 30, duration: 720 },
  { id: 'c1111111-1111-4111-8111-00000001440', name: 'FULL DAY', price: 50, duration: 1440 },
  { id: 'c1111111-1111-4111-8111-00000010080', name: 'WEEKLY', price: 180, duration: 10080 },
];

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
  });

  for (const p of CUSTOMER_PLANS) {
    await conn.query(
      `INSERT INTO parking_plans (id, name, price, duration, plan_type, tax_percent, status)
       VALUES (?, ?, ?, ?, 'Hourly', 0, 'Active')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         price = VALUES(price),
         duration = VALUES(duration),
         status = 'Active'`,
      [p.id, p.name, p.price, p.duration],
    );
    console.log(`[seed-customer-plans] ${p.name} (${p.duration}m) -> ${p.id}`);
  }

  await conn.end();
  console.log('[seed-customer-plans] Done');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
