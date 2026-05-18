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
    await conn.query(`DELETE FROM admins WHERE email LIKE '%@sample.parksmart.test'`);
    await conn.query(`DELETE FROM users WHERE email LIKE '%@sample.parksmart.test'`);
    await conn.query(`DELETE FROM auth_tokens WHERE refresh_token LIKE 'SEED-TOKEN-%'`);
    await conn.query(`DELETE FROM ticket_photos WHERE photo_url LIKE '%seed-photo-%'`);
    await conn.query(`DELETE FROM system_settings WHERE timezone LIKE 'Seed TZ %' OR currency LIKE 'Seed %'`);
    await conn.query(`DELETE FROM branding_settings WHERE system_name LIKE 'Seed Brand %'`);
    await conn.query(`DELETE FROM admin_roles_permissions WHERE permissions LIKE '%seed-permission-%'`);
    await conn.query(`DELETE FROM email_logs WHERE recipient_email LIKE '%@sample.parksmart.test' OR subject LIKE 'Seeded email %'`);
    await conn.query(`DELETE FROM taxes WHERE description LIKE 'Seeded tax row%'`);
    await conn.query(`DELETE FROM pricings WHERE description LIKE 'Seeded pricing %'`);
    await conn.query(`DELETE FROM audit_logs WHERE details LIKE 'Seeded audit row%'`);
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
  let adminId = adminRows[0]?.id || null;

  const [[{ id: ownerRoleId } = {}]] = await conn.query(`SELECT id FROM roles WHERE name = 'owner' LIMIT 1`);
  const [[{ id: userRoleId } = {}]] = await conn.query(`SELECT id FROM roles WHERE name = 'user' LIMIT 1`);
  const [[{ id: inspectorRoleId } = {}]] = await conn.query(`SELECT id FROM roles WHERE name = 'inspector' LIMIT 1`);
  const fallbackRoleId = userRoleId || inspectorRoleId;
  if (!ownerRoleId || !fallbackRoleId) {
    console.error('[SEED] Missing required roles; ensure owner, user, and inspector exist.');
    await conn.end();
    process.exit(1);
  }

  if (!adminId) {
    adminId = randomUUID();
    const ownerPassword = await bcrypt.hash('Owner@123', 10);
    await conn.query(
      `INSERT IGNORE INTO admins (id, email, password_hash, full_name, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'owner@sample.parksmart.test', ownerPassword, 'Owner Admin', ownerRoleId, 1]
    );
    console.log('[SEED] Created owner admin sample account.');
  }

  const [[{ cnt: adminCount }]] = await conn.query('SELECT COUNT(*) AS cnt FROM admins');
  for (let i = adminCount + 1; i <= 20; i += 1) {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await conn.query(
      `INSERT IGNORE INTO admins (id, email, password_hash, full_name, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, `admin${i}@sample.parksmart.test`, passwordHash, `Sample Admin ${i}`, ownerRoleId, i % 9 !== 0 ? 1 : 0]
    );
  }

  const pwd = await bcrypt.hash('Officer@123', 10);
  const officerIds = [];
  for (let i = 0; i < 20; i += 1) officerIds.push(randomUUID());

  for (let i = 0; i < 20; i += 1) {
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
  for (let i = 0; i < 20; i += 1) {
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

  const zones = Array.from({ length: 20 }, (_, idx) => {
    const n = idx + 1;
    return {
      id: `ZONE-${200 + n}`,
      parking_name: `Sample Zone ${n}`,
      address: `${100 + idx} ${LOCATIONS[idx % LOCATIONS.length]} Blvd, ${LOCATIONS[idx % LOCATIONS.length]}`,
      image_url: `https://images.unsplash.com/photo-15${10 + idx}000000000?auto=format&fit=crop&q=80`,
      hourly_rate: 3 + (idx % 6) * 0.75,
      available_spots: 5 + (idx % 10),
      total_spots: 20 + (idx % 15),
      spot_id: `Z-${100 + n}`,
    };
  });

  for (const zone of zones) {
    await conn.query(
      `INSERT IGNORE INTO parking_zones (id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        zone.id,
        zone.parking_name,
        zone.address,
        zone.image_url,
        zone.hourly_rate,
        zone.available_spots,
        zone.total_spots,
        zone.spot_id,
      ]
    );
  }

  const sessionIds = [];
  const now = new Date();
  for (let i = 0; i < 40; i += 1) {
    const id = randomUUID();
    sessionIds.push(id);
    const plan = planIds[i % planIds.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const officer = officerIds[i % officerIds.length];
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
      [id, plate, plan, planNames[i % planNames.length], loc, fmt(start), fmt(end), durationM, status, officer]
    );
  }

  const ruleRows = [];
  for (let i = 0; i < 20; i += 1) {
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
    const officer = officerIds[i % officerIds.length];
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

  for (let i = 0; i < 20; i += 1) {
    await conn.query(
      `INSERT IGNORE INTO email_logs (recipient_email, email_type, subject, related_id, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        `portaluser${i + 1}@sample.parksmart.test`,
        i % 2 === 0 ? 'notification' : 'alert',
        `Seeded email ${i + 1}`,
        i % 2 === 0 ? sessionIds[i % sessionIds.length] : ticketIds[i % ticketIds.length],
        i % 5 === 0 ? 'failed' : 'sent',
        i % 5 === 0 ? 'SMTP connection failed' : null,
      ]
    );
  }

  const userIds = [];
  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    userIds.push(id);
    const roleId = fallbackRoleId;
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

  const authTokenIds = [];
  const tokenOwnerIds = [adminId, ...officerIds.slice(0, 8), ...userIds.slice(0, 8)];
  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    const userId = tokenOwnerIds[i % tokenOwnerIds.length];
    authTokenIds.push(id);
    const userType = i < 1 ? 'admin' : i < 9 ? 'officer' : 'user';
    const tokenOwner = userType === 'admin' ? adminId : userType === 'officer' ? officerIds[i % officerIds.length] : userIds[i % userIds.length];
    await conn.query(
      `INSERT IGNORE INTO auth_tokens (id, user_id, user_type, refresh_token, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        tokenOwner,
        userType,
        `SEED-TOKEN-${i + 1}-${Date.now()}`,
        fmt(new Date(Date.now() + 86400000 * (i + 1))),
      ]
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    const ticketId = ticketIds[i % ticketIds.length];
    await conn.query(
      `INSERT IGNORE INTO ticket_photos (id, ticket_id, photo_url, photo_taken_at, uploaded_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        ticketId,
        `https://example.com/seed-photo-${i + 1}.jpg`,
        fmt(new Date(Date.now() - (i * 3600000))),
        fmt(new Date(Date.now() - (i * 1800000))),
      ]
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    await conn.query(
      `INSERT IGNORE INTO system_settings (id, timezone, language, date_format, time_format, week_starts_on, currency, session_expiry_display, tax_rate_percent, service_fee, rounding_rule, prices_include_tax, refund_allowed, refund_approval_required)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        `Seed TZ ${i + 1}`,
        ['en', 'es', 'fr', 'de'][i % 4],
        i % 2 === 0 ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
        i % 2 === 0 ? '12h' : '24h',
        i % 2 === 0 ? 'sunday' : 'monday',
        `Seed ${i + 1}`,
        30 + i,
        5 + (i % 5),
        0 + (i % 4) * 0.5,
        i % 3 === 0 ? 'nearest_cent' : 'round_down',
        i % 2,
        1,
        0,
      ]
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    await conn.query(
      `INSERT IGNORE INTO branding_settings (id, system_name, theme_color, dark_mode, logo_url, favicon_url, sidebar_collapsed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        `Seed Brand ${i + 1}`,
        ['#0F766E', '#1D4ED8', '#B91C1C', '#0EA5E9'][i % 4],
        i % 3 === 0 ? 'dark' : 'light',
        `https://example.com/brand-logo-${i + 1}.svg`,
        `https://example.com/brand-favicon-${i + 1}.ico`,
        i % 2,
      ]
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    const roleId = [ownerRoleId, userRoleId, inspectorRoleId][i % 3];
    await conn.query(
      `INSERT IGNORE INTO admin_roles_permissions (id, role_id, permissions)
       VALUES (?, ?, ?)`,
      [
        id,
        roleId,
        JSON.stringify([`seed-permission-${i + 1}`, 'read', 'write']),
      ]
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    await conn.query(
      `INSERT IGNORE INTO taxes (id, name, rate, description, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        ['GST', 'VAT', 'City Levy', 'Tourism Tax', 'Eco Fee', 'Night Surcharge', 'Weekend Tax', 'Event Tax', 'Airport Fee', 'EV Discount Tax', 'Luxury Tax', 'Service Tax', 'Import Duty', 'Parking Tax', 'Service Charge', 'Local Tax', 'Surcharge', 'Security Fee', 'Transportation Tax', 'Environmental Fee'][i % 20],
        2 + (i % 9) * 0.75,
        `Seeded tax row ${i + 1}`,
        i !== 11 ? 1 : 0,
      ]
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const id = randomUUID();
    const amt = 8 + i * 3.5;
    await conn.query(
      `INSERT IGNORE INTO pricings (id, name, type, amount, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        `Price Tier ${i + 1}`,
        ['Base', 'Premium', 'Discount', 'Special', 'Corporate', 'Visitor', 'VIP', 'Student', 'Family', 'Holiday', 'Senior', 'Weekend', 'Business', 'Promo', 'Express', 'Off-Peak', 'Peak', 'Event', 'Long-Stay', 'Short-Stay'][i % 20].toLowerCase(),
        amt,
        `Seeded pricing ${i + 1}`,
        i !== 10 ? 1 : 0,
      ]
    );
  }

  console.log(
    '[SEED] Completed sample seeding for admins, officers, plans, zones, sessions, tickets, payments, rules, audit logs, auth tokens, users, ticket photos, settings, branding, permissions, taxes, and pricings.',
  );
  await conn.end();
};

run().catch((err) => {
  console.error('[SEED] Failed:', err.message || err);
  process.exit(1);
});
