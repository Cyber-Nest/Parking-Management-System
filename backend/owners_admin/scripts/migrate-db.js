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

  const addColumn = async (table, column, ddl) => {
    const [c] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (!c.length) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`);
      console.log(`[DB MIGRATE] Added ${table}.${column}`);
    }
  };

  await addColumn('parking_plans', 'plan_type', "`plan_type` VARCHAR(50) NULL DEFAULT 'Hourly' AFTER `duration`");
  await addColumn('parking_plans', 'tax_percent', '`tax_percent` DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER `plan_type`');
  await addColumn('parking_plans', 'status', "`status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active' AFTER `tax_percent`");
  await addColumn('parking_plans', 'parking_lot_id', '`parking_lot_id` VARCHAR(60) NULL AFTER `status`');

  await addColumn('parking_sessions', 'location_name', '`location_name` VARCHAR(150) NULL AFTER `plan_name`');
  await addColumn('bookings', 'parking_plan_id', '`parking_plan_id` CHAR(36) NULL AFTER `duration_label`');
  await addColumn('bookings', 'parking_lot_id', '`parking_lot_id` CHAR(36) NULL AFTER `booking_reference`');
  await addColumn(
    'parking_zones',
    'status',
    "`status` ENUM('active','inactive') NOT NULL DEFAULT 'active' AFTER `spot_id`",
  );

  await addColumn('penalty_rules', 'description', '`description` TEXT NULL AFTER `grace_minutes`');

  console.log('[DB MIGRATE] Checking penalty_rules columns...');
  const [prCols] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'penalty_rules'`
  );
  console.log('[DB MIGRATE] penalty_rules columns:', prCols.map(c => c.COLUMN_NAME));

  await addColumn('penalty_tickets', 'location_name', '`location_name` VARCHAR(150) NULL AFTER `license_plate`');
  await addColumn('penalty_tickets', 'note', '`note` TEXT NULL AFTER `remarks`');

  await addColumn('payments', 'receipt_number', '`receipt_number` VARCHAR(64) NULL AFTER `paid_at`');
  await addColumn('payments', 'receipt_date', '`receipt_date` DATETIME NULL AFTER `receipt_number`');

  const [[paymentMethodColumn]] = await conn.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'payment_method'`
  );
  if (paymentMethodColumn && String(paymentMethodColumn.COLUMN_TYPE).indexOf("'cash'") === -1) {
    await conn.query(`ALTER TABLE payments MODIFY payment_method ENUM('credit_card','debit_card','apple_pay','visa','mastercard','amex','cash') NOT NULL`);
    console.log('[DB MIGRATE] payments.payment_method enum updated to include cash');
  }

  await addColumn('taxes', 'type', "`type` ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage' AFTER `rate`");

  await addColumn('roles', 'description', '`description` TEXT NULL AFTER `name`');
  await addColumn('roles', 'permissions', '`permissions` TEXT NULL AFTER `description`');
  await addColumn('roles', 'updated_at', '`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`');

  const [[rolesNameRow]] = await conn.query(
    `SELECT DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'roles' AND COLUMN_NAME = 'name'`
  );
  if (rolesNameRow && String(rolesNameRow.DATA_TYPE).toLowerCase() === 'enum') {
    await conn.query(`ALTER TABLE roles MODIFY name VARCHAR(50) NOT NULL`);
    console.log('[DB MIGRATE] roles.name changed from ENUM to VARCHAR(50)');
  }

  const [prColsAmt] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pricings' AND COLUMN_NAME = 'base_price'`
  );
  const [prHasAmount] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pricings' AND COLUMN_NAME = 'amount'`
  );
  if (!prColsAmt.length) {
    await conn.query(
      'ALTER TABLE pricings ADD COLUMN `base_price` DECIMAL(10,2) NULL AFTER `name`'
    );
    if (prHasAmount.length) {
      await conn.query('UPDATE pricings SET base_price = amount WHERE base_price IS NULL');
    }
    await conn.query('UPDATE pricings SET base_price = 0 WHERE base_price IS NULL');
    await conn.query(
      'ALTER TABLE pricings MODIFY `base_price` DECIMAL(10,2) NOT NULL DEFAULT 0'
    );
    await conn.query(
      'ALTER TABLE pricings ADD COLUMN `additional_fees` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `base_price`'
    );
    await conn.query(
      'ALTER TABLE pricings ADD COLUMN `tax_id` CHAR(36) NULL AFTER `additional_fees`'
    );
    console.log('[DB MIGRATE] pricings.base_price/additional_fees/tax_id added (from amount)');
  }

  await addColumn('system_settings', 'tax_rate_percent', '`tax_rate_percent` DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER `session_expiry_display`');
  await addColumn('system_settings', 'service_fee', '`service_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `tax_rate_percent`');
  await addColumn('system_settings', 'rounding_rule', "`rounding_rule` VARCHAR(50) NOT NULL DEFAULT 'nearest_cent' AFTER `service_fee`");
  await addColumn('system_settings', 'prices_include_tax', '`prices_include_tax` TINYINT(1) NOT NULL DEFAULT 1 AFTER `rounding_rule`');
  await addColumn('system_settings', 'refund_allowed', '`refund_allowed` TINYINT(1) NOT NULL DEFAULT 1 AFTER `prices_include_tax`');
  await addColumn('system_settings', 'refund_approval_required', '`refund_approval_required` TINYINT(1) NOT NULL DEFAULT 1 AFTER `refund_allowed`');

  await addColumn('officers', 'assigned_zone', '`assigned_zone` VARCHAR(150) NULL AFTER `badge_number`');

  const [shiftTable] = await conn.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'officer_shifts'`,
  );
  if (!shiftTable.length) {
    await conn.query(`
      CREATE TABLE officer_shifts (
        id CHAR(36) PRIMARY KEY,
        officer_id CHAR(36) NOT NULL,
        started_at DATETIME NOT NULL,
        ended_at DATETIME NULL,
        status ENUM('active', 'ended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_officer_shifts_officer_status (officer_id, status),
        CONSTRAINT fk_officer_shifts_officer FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB MIGRATE] Created officer_shifts');
  }

  const [settingsTable] = await conn.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'officer_settings'`,
  );
  if (!settingsTable.length) {
    await conn.query(`
      CREATE TABLE officer_settings (
        officer_id CHAR(36) PRIMARY KEY,
        settings_json JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_officer_settings_officer FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB MIGRATE] Created officer_settings');
  }

  const [offlineTable] = await conn.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'officer_offline_records'`,
  );
  if (!offlineTable.length) {
    await conn.query(`
      CREATE TABLE officer_offline_records (
        id CHAR(36) PRIMARY KEY,
        officer_id CHAR(36) NOT NULL,
        record_type ENUM('ticket', 'evidence', 'payment', 'other') NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NULL,
        payload_json JSON NOT NULL,
        status ENUM('pending', 'syncing', 'synced', 'failed') NOT NULL DEFAULT 'pending',
        error_message TEXT NULL,
        client_id VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME NULL,
        INDEX idx_officer_offline_officer_status (officer_id, status),
        CONSTRAINT fk_officer_offline_officer FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB MIGRATE] Created officer_offline_records');
  }

  // Create parking_lots table (one per physical parking lot) and link parking_zones
  const [parkingLotsTable] = await conn.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'parking_lots'`
  );
  if (!parkingLotsTable.length) {
    await conn.query(`
      CREATE TABLE parking_lots (
        id VARCHAR(60) PRIMARY KEY,
        owner_id CHAR(36) NULL,
        lot_name VARCHAR(191) NOT NULL,
        address VARCHAR(255) NULL,
        image_url TEXT NULL,
        qr_code_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_parking_lots_owner FOREIGN KEY (owner_id) REFERENCES admins(id) ON DELETE SET NULL
      )
    `);
    console.log('[DB MIGRATE] Created parking_lots');
  } else {
    console.log('[DB MIGRATE] parking_lots already exists');
  }

  await addColumn('parking_zones', 'parking_lot_id', '`parking_lot_id` VARCHAR(60) NULL AFTER `id`');

  try {
    await conn.query(`ALTER TABLE parking_zones ADD CONSTRAINT fk_parking_zones_parking_lot FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE SET NULL`);
    console.log('[DB MIGRATE] Added FK parking_zones.parking_lot_id -> parking_lots.id');
  } catch (e) {
    console.log('[DB MIGRATE] Could not add FK for parking_zones.parking_lot_id (may already exist):', e.message);
  }

  await conn.end();
};

run().catch((err) => {
  console.error('[DB MIGRATE] Failed:', err.message || err);
  process.exit(1);
});

