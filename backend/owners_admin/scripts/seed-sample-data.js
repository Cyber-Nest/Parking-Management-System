/**
 * Rich sample data for local QA (10+ rows per major table where applicable).
 * Run after: npm run db:init && npm run db:migrate && npm run seed
 * Usage: npm run db:seed-sample
 * Force re-run: npm run db:seed-sample -- --force
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const LOCATIONS = [
  'Downtown',
  'Airport',
  'Mall',
  'Stadium',
  'City Center',
  'Market Street',
  'Residential Area',
  'Harbor',
  'University',
  'Transit Hub',
  'Medical Center',
  'Tech Park',
];

const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

const run = async () => {
  const force = process.argv.includes('--force');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
    multipleStatements: true,
  });

  if (force) {
    await conn.query(`DELETE FROM payments WHERE receipt_number LIKE 'RCP-SEED-%'`);
    await conn.query(`DELETE FROM penalty_tickets WHERE ticket_number LIKE 'SEED-TKT-%'`);
    await conn.query(`DELETE FROM parking_sessions WHERE license_plate LIKE 'SAM%'`);
    await conn.query(`DELETE FROM penalty_rules WHERE code LIKE 'VIO-4%'`);
    await conn.query(`DELETE FROM parking_plans WHERE name LIKE 'Sample Plan %'`);
    await conn.query(`DELETE FROM officers WHERE email LIKE '%@sample.parksmart.test'`);
    await conn.query(`DELETE FROM users WHERE email LIKE '%@sample.parksmart.test'`);
    await conn.query(`DELETE FROM taxes WHERE description LIKE 'Seeded tax row%'`);
    await conn.query(`DELETE FROM pricings WHERE description LIKE 'Seeded pricing %'`);
    await conn.query(`DELETE FROM audit_logs WHERE details LIKE 'Seeded audit row%'`);
    await conn.query(`DELETE FROM roles WHERE description LIKE 'Sample %'`);
  }

  const [[{ cnt: ticketCnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM penalty_tickets');
  if (!force && Number(ticketCnt) >= 20) {
    console.log('[SEED] penalty_tickets already has', ticketCnt, 'rows — skipping (use --force to re-seed).');
    await conn.end();
    return;
  }

  const [adminRows] = await conn.query(
    `SELECT a.id AS id FROM admins a JOIN roles r ON r.id = a.role_id WHERE r.name = 'owner' LIMIT 1`
  );
  const adminId = adminRows[0]?.id || null;
  if (!adminId) {
    console.error('[SEED] No owner admin found. Run npm run seed first.');
    await conn.end();
    process.exit(1);
  }

  const [[{ id: userRoleId } = {}]] = await conn.query(`SELECT id FROM roles WHERE name = 'user' LIMIT 1`);
  const [[{ id: inspectorRoleId } = {}]] = await conn.query(`SELECT id FROM roles WHERE name = 'inspector' LIMIT 1`);
  const fallbackRoleId = userRoleId || inspectorRoleId;
  if (!fallbackRoleId) {
    console.error('[SEED] Missing user/inspector role row in roles table.');
    await conn.end();
    process.exit(1);
  }

  const pwd = await bcrypt.hash('Officer@123', 10);
  const officerIds = [];
  for (let i = 0; i < 15; i += 1) officerIds.push(randomUUID());

  for (let i = 0; i < 15; i += 1) {
    const id = officerIds[i];
    const n = i + 1;
    await conn.query(
      `INSERT IGNORE INTO officers (id, created_by_admin_id, full_name, email, phone, password_hash, badge_number, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        adminId,
        `Officer ${n}`,
        `officer${n}@sample.parksmart.test`,
        `555-010${String(n).padStart(2, '0')}`,
        pwd,
        `BDG-${2000 + n}`,
        i % 5 === 0 ? 'SUPERVISOR' : 'OFFICER',
        i % 7 === 0 ? 'inactive' : 'active',
      ]
    );
  }

  const planIds = [];
  const planNames = [];
  const types = ['Hourly', 'Daily', 'Monthly', 'Event'];
  for (let i = 0; i < 15; i += 1) {
    const id = randomUUID();
    planIds.push(id);
    planNames.push(`Sample Plan ${i + 1}`);
    const price = 2 + i * 1.5;
    const duration = [60, 120, 180, 240, 480, 1440, 10080, 43200][i % 8];
    await conn.query(
      `INSERT IGNORE INTO parking_plans (id, name, price, duration, plan_type, tax_percent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        planNames[i],
        price,
        duration,
        types[i % 4],
        5 + (i % 3),
        i % 9 === 0 ? 'Inactive' : 'Active',
      ]
    );
  }

  const sessionIds = [];
  const now = new Date();
  for (let i = 0; i < 40; i += 1) {
    const id = randomUUID();
    sessionIds.push(id);
    const plan = planIds[i % 15];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const officer = officerIds[i % 15];
    const plate = `SAM${String(100 + i).padStart(3, '0')}`;
    const daysAgo = (i * 3) % 35;
    const start = new Date(now);
    start.setDate(start.getDate() - daysAgo);
    start.setHours(7 + (i % 12), (i * 11) % 60, 0, 0);
    const end = new Date(start.getTime() + (45 + (i % 8) * 15) * 60 * 1000);
    const durationM = Math.max(1, Math.round((end - start) / 60000));
    const statuses = ['active', 'expired', 'extended', 'cancelled'];
    const status = statuses[i % 4];
    await conn.query(
      `INSERT IGNORE INTO parking_sessions (id, license_plate, plan_id, plan_name, location_name, start_time, end_time, duration_minutes, status, created_by_officer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, plate, plan, planNames[i % 15], loc, fmt(start), fmt(end), durationM, status, officer]
    );
  }

  const ruleRows = [];
  for (let i = 0; i < 15; i += 1) {
    const id = randomUUID();
    const code = `VIO-${400 + i}-${randomUUID().slice(0, 8)}`;
    ruleRows.push({ id, code });
    await conn.query(
      `INSERT IGNORE INTO penalty_rules (id, violation, code, amount, grace_minutes, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        ['Overtime', 'No Parking', 'Expired Meter', 'Blocking', 'Fire Lane', 'Handicap'][i % 6],
        code,
        25 + i * 3,
        (i % 4) * 5,
        i % 11 === 0 ? 'Inactive' : 'Active',
      ]
    );
  }

  const ticketIds = [];
  for (let i = 0; i < 28; i += 1) {
    const id = randomUUID();
    ticketIds.push(id);
    const officer = officerIds[i % 15];
    const [offRows] = await conn.query(`SELECT full_name FROM officers WHERE id = ?`, [officer]);
    const offName = offRows[0]?.full_name;
    const plate = i % 5 === 0 ? `SAM${String(100 + (i % 40)).padStart(3, '0')}` : `TKT${200 + i}`;
    const loc = LOCATIONS[(i + 2) % LOCATIONS.length];
    const issued = new Date();
    issued.setDate(issued.getDate() - (i % 25));
    const due = new Date(issued.getTime() + (1 + (i % 7)) * 86400000);
    const st = ['unpaid', 'unpaid', 'paid', 'cancelled', 'disputed', 'resolved'][i % 6];
    const onSession = sessionIds[i % 40];
    await conn.query(
      `INSERT IGNORE INTO penalty_tickets
       (id, ticket_number, officer_id, officer_name, session_id, license_plate, location_name, amount, reason, status, date_issued, due_date, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        `SEED-TKT-${8000 + i}-${i}`,
        officer,
        offName || 'Officer',
        onSession,
        plate,
        loc,
        35 + i * 2,
        `${ruleRows[i % ruleRows.length].code} violation`,
        st,
        fmt(issued),
        fmt(due),
        i % 4 === 0 ? 'Follow-up required' : null,
      ]
    );
  }

  const paymentIds = [];
  const methods = ['credit_card', 'debit_card', 'visa', 'mastercard', 'apple_pay'];
  const payTypes = ['parking', 'penalty', 'extension'];
  for (let i = 0; i < 28; i += 1) {
    const id = randomUUID();
    paymentIds.push(id);
    const sessionIdx = i % 40;
    const plate = `SAM${String(100 + sessionIdx).padStart(3, '0')}`;
    const sess = sessionIds[i % 40];
    const typ = payTypes[i % 3];
    const ticket = i % 3 === 0 ? ticketIds[i % 28] : null;
    const paid = new Date();
    paid.setDate(paid.getDate() - (i % 20));
    const rcp = `RCP-SEED-${9000 + i}`;
    const rdt = fmt(paid);
    await conn.query(
      `INSERT IGNORE INTO payments (id, session_id, ticket_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_number, receipt_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'success', ?, ?, ?, ?)`,
      [id, sess, ticket, plate, 5 + i * 2.25, methods[i % methods.length], typ, `TXREF-${12000 + i}`, fmt(paid), rcp, rdt]
    );
  }

  for (let j = 0; j < 6; j += 1) {
    const id = randomUUID();
    const paid = new Date();
    paid.setDate(paid.getDate() - (j + 1));
    const rPlate = `SAM${String(100 + (j % 40)).padStart(3, '0')}`;
    await conn.query(
      `INSERT IGNORE INTO payments (id, session_id, ticket_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_number, receipt_date)
       VALUES (?, NULL, NULL, ?, ?, 'visa', 'parking', 'refunded', ?, ?, NULL, ?)`,
      [id, rPlate, 8.5 + j, `RFND-SEED-${j}`, fmt(paid), fmt(paid)]
    );
  }

  if (paymentIds[3] && ticketIds[2]) {
    await conn.query(`UPDATE penalty_tickets SET status = 'paid', paid_at = date_issued, payment_id = ? WHERE id = ?`, [
      paymentIds[3],
      ticketIds[2],
    ]);
  }

  for (let i = 0; i < 22; i += 1) {
    await conn.query(
      `INSERT INTO audit_logs (id, user_id, user_name, action, module, resource_id, resource_name, details, status)
       VALUES (?, ?, 'Admin User', ?, ?, ?, ?, ?, 'success')`,
      [
        randomUUID(),
        adminId,
        ['create', 'update', 'delete', 'export', 'view'][i % 5],
        ['payments', 'tickets', 'sessions', 'settings', 'reports'][i % 5],
        randomUUID(),
        `resource-${i}`,
        `Seeded audit row ${i + 1}`,
      ]
    );
  }

  const EXTRA_ROLES = [
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'Admin'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', 'Manager'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03', 'Supervisor'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04', 'Operator'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05', 'Auditor'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06', 'Support'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07', 'Analyst'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08', 'Lead'],
  ];
  const extraRoleIds = [];
  for (const [rid, rname] of EXTRA_ROLES) {
    extraRoleIds.push(rid);
    await conn.query(
      `INSERT IGNORE INTO roles (id, name, description, permissions)
       VALUES (?, ?, ?, ?)`,
      [rid, rname, `Sample ${rname} role`, JSON.stringify(['read', 'write'])]
    );
  }

  const userIds = [];
  for (let i = 0; i < 14; i += 1) {
    const id = randomUUID();
    userIds.push(id);
    const roleId = i % 3 === 0 && extraRoleIds[0] ? extraRoleIds[i % extraRoleIds.length] : fallbackRoleId;
    const hp = await bcrypt.hash('User@123', 10);
    await conn.query(
      `INSERT IGNORE INTO users (id, username, email, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        `portaluser${i + 1}`,
        `portaluser${i + 1}@sample.parksmart.test`,
        hp,
        roleId,
        i % 8 !== 0 ? 1 : 0,
      ]
    );
  }

  for (let i = 0; i < 14; i += 1) {
    const id = randomUUID();
    await conn.query(
      `INSERT IGNORE INTO taxes (id, name, rate, description, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        ['GST', 'VAT', 'City Levy', 'Tourism Tax', 'Eco Fee', 'Night Surcharge', 'Weekend Tax', 'Event Tax', 'Airport Fee', 'EV Discount Tax', 'Luxury Tax', 'Service Tax', 'Import Duty', 'Parking Tax'][i % 14],
        2 + (i % 9) * 0.75,
        `Seeded tax row ${i + 1}`,
        i !== 11 ? 1 : 0,
      ]
    );
  }

  for (let i = 0; i < 14; i += 1) {
    const id = randomUUID();
    const amt = 8 + i * 3.5;
    await conn.query(
      `INSERT IGNORE INTO pricings (id, name, type, amount, description, is_active, base_price, additional_fees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        `Price Tier ${i + 1}`,
        ['Base', 'Premium', 'Discount', 'Special', 'Corporate', 'Visitor', 'VIP', 'Student'][i % 8].toLowerCase(),
        amt,
        `Seeded pricing ${i + 1}`,
        i !== 10 ? 1 : 0,
        amt,
        i % 4 === 0 ? 1.5 : 0,
      ]
    );
  }

  console.log(
    '[SEED] Sample officers, plans, sessions, tickets, payments, rules, audit, extra roles, portal users, taxes, pricings inserted.',
  );
  await conn.end();
};

run().catch((err) => {
  console.error('[SEED] Failed:', err.message || err);
  process.exit(1);
});
