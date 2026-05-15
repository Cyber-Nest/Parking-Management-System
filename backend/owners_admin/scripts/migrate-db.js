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

  await addColumn('parking_sessions', 'location_name', '`location_name` VARCHAR(150) NULL AFTER `plan_name`');

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

  await conn.end();
};

run().catch((err) => {
  console.error('[DB MIGRATE] Failed:', err.message || err);
  process.exit(1);
});

