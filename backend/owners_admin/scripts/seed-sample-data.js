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
  // Create 10 officers for better performance metrics
  const officers = [
    { id: uuid(), full_name: 'John Smith', email: 'john.smith@parking.com', phone: '+1234567890', badge_number: 'OF-1001', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'Sarah Wright', email: 'sarah.wright@parking.com', phone: '+1987654321', badge_number: 'OF-1002', role: 'SUPERVISOR', status: 'active' },
    { id: uuid(), full_name: 'Mike Turner', email: 'mike.turner@parking.com', phone: '+1123456789', badge_number: 'OF-1003', role: 'OFFICER', status: 'suspended' },
    { id: uuid(), full_name: 'Emily Chen', email: 'emily.chen@parking.com', phone: '+1555666777', badge_number: 'OF-1004', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'David Brown', email: 'david.brown@parking.com', phone: '+1444333222', badge_number: 'OF-1005', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'Jessica Lee', email: 'jessica.lee@parking.com', phone: '+1777888999', badge_number: 'OF-1006', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'Robert Martinez', email: 'robert.martinez@parking.com', phone: '+1666555444', badge_number: 'OF-1007', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'Lisa Anderson', email: 'lisa.anderson@parking.com', phone: '+1333222111', badge_number: 'OF-1008', role: 'SUPERVISOR', status: 'active' },
    { id: uuid(), full_name: 'James Wilson', email: 'james.wilson@parking.com', phone: '+1999888777', badge_number: 'OF-1009', role: 'OFFICER', status: 'active' },
    { id: uuid(), full_name: 'Michelle Taylor', email: 'michelle.taylor@parking.com', phone: '+1222111000', badge_number: 'OF-1010', role: 'OFFICER', status: 'inactive' },
  ];

  for (const o of officers) {
    await conn.query(
      `INSERT IGNORE INTO officers
      (id, created_by_admin_id, full_name, email, phone, password_hash, badge_number, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.id, owner.id, o.full_name, o.email, o.phone, officerPasswordHash, o.badge_number, o.role, o.status]
    );
  }

  // Get all officers
  const [officerRows] = await conn.query(
    `SELECT id, full_name FROM officers ORDER BY created_at ASC`
  );

  // Create 60 penalty tickets across different dates
  const ticketIds = [];
  for (let i = 0; i < 60; i += 1) {
    const officer = officerRows[i % officerRows.length];
    const id = uuid();
    const ticketNo = `TKT-${100200 + i}`;
    const statusPool = ['unpaid', 'unpaid', 'unpaid', 'paid', 'paid', 'disputed', 'cancelled'];
    const status = statusPool[i % statusPool.length];
    const amount = [50, 75, 100, 120, 150][i % 5];
    const daysAgo = Math.floor(i / 2) + 1;

    await conn.query(
      `INSERT IGNORE INTO penalty_tickets
      (id, ticket_number, officer_id, officer_name, license_plate, amount, reason, status, date_issued, due_date, remarks, dispute_raised)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL ? DAY), INTERVAL 14 DAY), ?, ?)`,
      [
        id,
        ticketNo,
        officer.id,
        officer.full_name,
        plate(),
        amount,
        i % 3 === 0 ? 'Expired Parking' : (i % 3 === 1 ? 'No Parking Zone' : 'Invalid Permit'),
        status,
        daysAgo,
        daysAgo,
        'Generated sample ticket',
        status === 'disputed' ? 1 : 0,
      ]
    );
    ticketIds.push({ id, status, amount });
  }

  // Create 50 parking sessions
  const [sessionPlans] = await conn.query(
    `SELECT id, name, price, duration FROM parking_plans ORDER BY created_at ASC LIMIT 4`
  );

  const sessionRows = [];
  for (let i = 0; i < 50; i += 1) {
    const plan = sessionPlans[i % sessionPlans.length];
    const officer = officerRows[i % officerRows.length];
    const id = uuid();
    const license = plate();
    const startTime = new Date(Date.now() - (i + Math.floor(i / 5)) * 2 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + plan.duration * 60 * 1000);
    const statuses = ['active', 'expired', 'extended', 'cancelled', 'completed'];
    const status = statuses[i % statuses.length];

    await conn.query(
      `INSERT IGNORE INTO parking_sessions
      (id, user_id, vehicle_id, license_plate, plan_id, plan_name, start_time, end_time, duration_minutes, status, notes, created_by_officer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        null,
        null,
        license,
        plan.id,
        plan.name,
        startTime,
        endTime,
        plan.duration,
        status,
        'Sample session data',
        officer.id,
      ]
    );
    sessionRows.push({ id, license, amount: plan.price });
  }

  // Create 80 payments - mix of session and ticket payments
  for (let i = 0; i < 40; i += 1) {
    const session = sessionRows[i % sessionRows.length];
    const id = uuid();

    await conn.query(
      `INSERT IGNORE INTO payments
      (id, session_id, ticket_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_email_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        session.id,
        null,
        session.license,
        session.amount,
        ['visa', 'mastercard', 'amex'][i % 3],
        'parking',
        'success',
        `TXN-${Date.now()}-${i}`,
        new Date(Date.now() - (i * 60 * 60 * 1000)),
        1,
      ]
    );
  }

  // Create 40 ticket payments
  for (let i = 0; i < 40; i += 1) {
    const ticket = ticketIds[i % ticketIds.length];
    const id = uuid();
    const statuses = ['success', 'success', 'success', 'pending', 'failed', 'refunded'];
    const status = statuses[i % statuses.length];

    await conn.query(
      `INSERT IGNORE INTO payments
      (id, ticket_id, session_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_email_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ticket.id,
        null,
        plate(),
        ticket.amount,
        ['visa', 'mastercard', 'debit_card', 'amex'][i % 4],
        'penalty',
        status,
        `TXN-${Date.now()}-TICKET-${i}`,
        status === 'success' || status === 'refunded' ? new Date(Date.now() - (i * 60 * 60 * 1000)) : null,
        status === 'success' ? 1 : 0,
      ]
    );
  }

  await conn.query(
    `INSERT IGNORE INTO system_settings
     (id, timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display)
     VALUES
     ('00000000-0000-0000-0000-000000000001', 'UTC', 'en', 'MM/DD/YYYY', '12h', 'sunday', 'USD', 30)`
  );

  await conn.query(
    `INSERT IGNORE INTO branding_settings
     (id, system_name, theme_color, dark_mode, logo_url, favicon_url, sidebar_collapsed)
     VALUES
     ('00000000-0000-0000-0000-000000000001', 'ParkSmart', '#0F766E', 'system', null, null, 0)`
  );

  // Create audit log entries
  for (let i = 0; i < 30; i += 1) {
    const officer = officerRows[i % officerRows.length];
    await conn.query(
      `INSERT IGNORE INTO audit_logs
       (id, user_id, user_name, action, module, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        officer.id,
        officer.full_name,
        ['Login', 'Issued Ticket', 'Updated Payment', 'Extended Session', 'Created Report'][i % 5],
        ['System', 'Tickets', 'Payments', 'Sessions', 'Reports'][i % 5],
        `Sample audit log entry ${i}`,
        'success',
      ]
    );
  }

  // Penalty rules
  const rules = [
    { id: uuid(), violation: 'Expired Parking', code: 'EXP-PARK', amount: 50, grace_minutes: 10, description: 'Vehicle stayed beyond purchased time', status: 'Active' },
    { id: uuid(), violation: 'No Parking Zone', code: 'NO-ZONE', amount: 75, grace_minutes: 0, description: 'Parked in a restricted area', status: 'Active' },
    { id: uuid(), violation: 'Blocking Fire Lane', code: 'FIRE-LANE', amount: 120, grace_minutes: 0, description: 'Blocking emergency access', status: 'Active' },
    { id: uuid(), violation: 'Invalid Permit', code: 'INV-PERMIT', amount: 60, grace_minutes: 5, description: 'Permit missing/invalid for zone', status: 'Inactive' },
    { id: uuid(), violation: 'Double Parking', code: 'DBL-PARK', amount: 100, grace_minutes: 0, description: 'Parked in two spaces', status: 'Active' },
  ];

  for (const r of rules) {
    await conn.query(
      `INSERT IGNORE INTO penalty_rules
      (id, violation, code, amount, grace_minutes, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.violation, r.code, r.amount, r.grace_minutes, r.description, r.status]
    );
  }

  const [[planCount]] = await conn.query(`SELECT COUNT(*) AS total FROM parking_plans`);
  const [[officerCount]] = await conn.query(`SELECT COUNT(*) AS total FROM officers`);
  const [[ticketCount]] = await conn.query(`SELECT COUNT(*) AS total FROM penalty_tickets`);
  const [[paymentCount]] = await conn.query(`SELECT COUNT(*) AS total FROM payments`);
  const [[sessionCount]] = await conn.query(`SELECT COUNT(*) AS total FROM parking_sessions`);

  console.log('[SAMPLE SEED] Done.');
  console.log({
    parking_plans: planCount.total,
    officers: officerCount.total,
    parking_sessions: sessionCount.total,
    penalty_tickets: ticketCount.total,
    payments: paymentCount.total,
    penalty_rules: rules.length,
    audit_logs: 30,
    sample_officer_password: 'Officer@123',
  });

  await conn.end();
};

run().catch((err) => {
  console.error('[SAMPLE SEED] Failed:', err.message || err);
  process.exit(1);
});
