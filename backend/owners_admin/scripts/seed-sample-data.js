require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const uuid = () => crypto.randomUUID();
const plate = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const part = () => letters[Math.floor(Math.random() * letters.length)];
  return `${part()}${part()}${part()}-${1000 + Math.floor(Math.random() * 9000)}`;
};

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
  });

  const [ownerRows] = await conn.query(
    `SELECT a.id, a.full_name
     FROM admins a
     JOIN roles r ON a.role_id = r.id
     WHERE r.name = 'owner'
     ORDER BY a.created_at ASC
     LIMIT 1`
  );

  if (!ownerRows.length) {
    throw new Error('No owner admin found. Run npm run seed first.');
  }

  const owner = ownerRows[0];

  const planRows = [
    { id: uuid(), name: 'Hourly Basic', price: 20, duration: 60 },
    { id: uuid(), name: 'Half Day', price: 80, duration: 240 },
    { id: uuid(), name: 'Full Day', price: 150, duration: 720 },
    { id: uuid(), name: 'Weekly Pass', price: 700, duration: 10080 },
  ];

  for (const p of planRows) {
    await conn.query(
      `INSERT IGNORE INTO parking_plans (id, name, price, duration)
       VALUES (?, ?, ?, ?)`,
      [p.id, p.name, p.price, p.duration]
    );
  }

  const officerPasswordHash = await bcrypt.hash('Officer@123', 10);
  const officers = [
    { id: uuid(), full_name: 'John Smith', email: 'john.smith@parking.com', phone: '+1234567890', badge_number: 'OF-1001', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'Sarah Wright', email: 'sarah.wright@parking.com', phone: '+1987654321', badge_number: 'OF-1002', role: 'SUPERVISOR', status: 'active' },
    { id: uuid(), full_name: 'Mike Turner', email: 'mike.turner@parking.com', phone: '+1123456789', badge_number: 'OF-1003', role: 'OFFICER', status: 'suspended' },
  ];

  for (const o of officers) {
    await conn.query(
      `INSERT IGNORE INTO officers
      (id, created_by_admin_id, full_name, email, phone, password_hash, badge_number, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.id, owner.id, o.full_name, o.email, o.phone, officerPasswordHash, o.badge_number, o.role, o.status]
    );
  }

  const [officerRows] = await conn.query(
    `SELECT id, full_name FROM officers ORDER BY created_at ASC LIMIT 3`
  );

  if (!officerRows.length) {
    throw new Error('No officers found after seeding.');
  }

  const ticketIds = [];
  for (let i = 0; i < 12; i += 1) {
    const officer = officerRows[i % officerRows.length];
    const id = uuid();
    const ticketNo = `TKT-${100200 + i}`;
    const statusPool = ['unpaid', 'paid', 'paid', 'unpaid', 'disputed'];
    const status = statusPool[i % statusPool.length];
    const amount = [50, 75, 100, 120][i % 4];
    const issuedHoursAgo = 2 + i * 3;

    await conn.query(
      `INSERT IGNORE INTO penalty_tickets
      (id, ticket_number, officer_id, officer_name, license_plate, amount, reason, status, date_issued, due_date, remarks, dispute_raised)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR), DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?)`,
      [
        id,
        ticketNo,
        officer.id,
        officer.full_name,
        plate(),
        amount,
        i % 2 === 0 ? 'Expired Parking' : 'No Parking Zone',
        status,
        issuedHoursAgo,
        'Generated sample ticket',
        status === 'disputed' ? 1 : 0,
      ]
    );
    ticketIds.push({ id, status, amount });
  }

  for (let i = 0; i < 14; i += 1) {
    const id = uuid();
    const statuses = ['success', 'success', 'pending', 'failed'];
    const types = ['parking', 'penalty', 'extension'];
    const methods = ['visa', 'mastercard', 'credit_card', 'debit_card', 'amex'];
    const status = statuses[i % statuses.length];
    const paymentType = types[i % types.length];
    const amount = paymentType === 'parking' ? 40 + i * 5 : 60 + i * 7;
    const linkedTicket = paymentType === 'penalty' ? ticketIds[i % ticketIds.length].id : null;

    await conn.query(
      `INSERT IGNORE INTO payments
      (id, ticket_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_email_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        linkedTicket,
        plate(),
        amount,
        methods[i % methods.length],
        paymentType,
        status,
        `TXN-${Date.now()}-${i}`,
        status === 'success' ? new Date() : null,
        status === 'success' ? 1 : 0,
      ]
    );
  }

  const [[planCount]] = await conn.query(`SELECT COUNT(*) AS total FROM parking_plans`);
  const [[officerCount]] = await conn.query(`SELECT COUNT(*) AS total FROM officers`);
  const [[ticketCount]] = await conn.query(`SELECT COUNT(*) AS total FROM penalty_tickets`);
  const [[paymentCount]] = await conn.query(`SELECT COUNT(*) AS total FROM payments`);

  console.log('[SAMPLE SEED] Done.');
  console.log({
    parking_plans: planCount.total,
    officers: officerCount.total,
    penalty_tickets: ticketCount.total,
    payments: paymentCount.total,
    sample_officer_password: 'Officer@123',
  });

  await conn.end();
};

run().catch((err) => {
  console.error('[SAMPLE SEED] Failed:', err.message || err);
  process.exit(1);
});
