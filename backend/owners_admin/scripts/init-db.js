require('dotenv').config();
const mysql = require('mysql2/promise');

const run = async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const database = process.env.DB_NAME || 'parksmart';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  const baseSql = `
    CREATE DATABASE IF NOT EXISTS \`${database}\`;
    USE \`${database}\`;

    CREATE TABLE IF NOT EXISTS roles (
      id CHAR(36) PRIMARY KEY,
      name ENUM('owner', 'inspector', 'user') NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(191) NOT NULL,
      role_id CHAR(36) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      reset_token VARCHAR(255) NULL,
      reset_token_expires_at DATETIME NULL,
      last_login_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_admin_role FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS officers (
      id CHAR(36) PRIMARY KEY,
      created_by_admin_id CHAR(36) NULL,
      full_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      phone VARCHAR(50) NULL,
      password_hash VARCHAR(255) NOT NULL,
      badge_number VARCHAR(100) NULL,
      role ENUM('OFFICER', 'SUPERVISOR') NOT NULL DEFAULT 'OFFICER',
      status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
      reset_token VARCHAR(255) NULL,
      reset_token_expires_at DATETIME NULL,
      last_login_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_officer_admin FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      user_type ENUM('admin', 'officer', 'user') NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parking_plans (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration INT NOT NULL COMMENT 'minutes',
      plan_type VARCHAR(50) NULL DEFAULT 'Hourly',
      tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parking_sessions (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NULL,
      vehicle_id CHAR(36) NULL,
      license_plate VARCHAR(50) NOT NULL,
      plan_id CHAR(36) NULL,
      plan_name VARCHAR(150) NULL,
      location_name VARCHAR(150) NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      duration_minutes INT NOT NULL,
      status ENUM('active', 'expired', 'extended', 'cancelled') NOT NULL DEFAULT 'active',
      notes TEXT NULL,
      created_by_officer CHAR(36) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_session_plan FOREIGN KEY (plan_id) REFERENCES parking_plans(id) ON DELETE SET NULL,
      CONSTRAINT fk_session_officer FOREIGN KEY (created_by_officer) REFERENCES officers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id CHAR(36) PRIMARY KEY,
      session_id CHAR(36) NULL,
      ticket_id CHAR(36) NULL,
      user_id CHAR(36) NULL,
      license_plate VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method ENUM('credit_card', 'debit_card', 'apple_pay', 'visa', 'mastercard', 'amex') NOT NULL,
      payment_type ENUM('parking', 'penalty', 'extension') NOT NULL,
      status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'success',
      transaction_ref VARCHAR(191) NULL,
      paid_at DATETIME NULL,
      receipt_number VARCHAR(64) NULL,
      receipt_date DATETIME NULL,
      receipt_email_sent TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payments_license_plate (license_plate),
      INDEX idx_payments_created_at (created_at)
    );

    CREATE TABLE IF NOT EXISTS penalty_tickets (
      id CHAR(36) PRIMARY KEY,
      ticket_number VARCHAR(100) NOT NULL UNIQUE,
      officer_id CHAR(36) NOT NULL,
      officer_name VARCHAR(191) NOT NULL,
      session_id CHAR(36) NULL,
      license_plate VARCHAR(50) NOT NULL,
      location_name VARCHAR(150) NULL,
      amount DECIMAL(10,2) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      status ENUM('unpaid', 'paid', 'cancelled', 'disputed', 'resolved') NOT NULL DEFAULT 'unpaid',
      date_issued DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME NULL,
      paid_at DATETIME NULL,
      payment_id CHAR(36) NULL,
      remarks TEXT NULL,
      note TEXT NULL,
      dispute_raised TINYINT(1) NOT NULL DEFAULT 0,
      dispute_message TEXT NULL,
      dispute_at DATETIME NULL,
      dispute_resolved_at DATETIME NULL,
      dispute_response TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_ticket_officer FOREIGN KEY (officer_id) REFERENCES officers(id),
      CONSTRAINT fk_ticket_session FOREIGN KEY (session_id) REFERENCES parking_sessions(id) ON DELETE SET NULL,
      INDEX idx_tickets_license_plate (license_plate),
      INDEX idx_tickets_date_issued (date_issued)
    );

    CREATE TABLE IF NOT EXISTS ticket_photos (
      id CHAR(36) PRIMARY KEY,
      ticket_id CHAR(36) NOT NULL,
      photo_url TEXT NOT NULL,
      photo_taken_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_ticket_photo_ticket FOREIGN KEY (ticket_id) REFERENCES penalty_tickets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      recipient_email VARCHAR(191) NOT NULL,
      email_type VARCHAR(100) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      related_id CHAR(36) NULL,
      status ENUM('sent', 'failed') NOT NULL,
      error_message TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS penalty_rules (
      id CHAR(36) PRIMARY KEY,
      violation VARCHAR(150) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      grace_minutes INT DEFAULT 0,
      description TEXT NULL,
      status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id CHAR(36) PRIMARY KEY,
      timezone VARCHAR(100) DEFAULT 'UTC',
      language VARCHAR(50) DEFAULT 'en',
      date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
      time_format VARCHAR(10) DEFAULT '12h',
      week_starts_on VARCHAR(10) DEFAULT 'sunday',
      currency VARCHAR(10) DEFAULT 'USD',
      session_expiry_display INT DEFAULT 30,
      tax_rate_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
      service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      rounding_rule VARCHAR(50) NOT NULL DEFAULT 'nearest_cent',
      prices_include_tax TINYINT(1) NOT NULL DEFAULT 1,
      refund_allowed TINYINT(1) NOT NULL DEFAULT 1,
      refund_approval_required TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branding_settings (
      id CHAR(36) PRIMARY KEY,
      system_name VARCHAR(150) DEFAULT 'ParkSmart',
      theme_color VARCHAR(20) DEFAULT '#0F766E',
      dark_mode VARCHAR(20) DEFAULT 'system',
      logo_url TEXT NULL,
      favicon_url TEXT NULL,
      sidebar_collapsed TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_roles_permissions (
      id CHAR(36) PRIMARY KEY,
      role_id CHAR(36) NOT NULL,
      permissions JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      user_name VARCHAR(191) NOT NULL,
      action VARCHAR(100) NOT NULL,
      module VARCHAR(100) NOT NULL,
      resource_id CHAR(36) NULL,
      resource_name VARCHAR(255) NULL,
      details TEXT NULL,
      old_value JSON NULL,
      new_value JSON NULL,
      ip_address VARCHAR(50) NULL,
      user_agent TEXT NULL,
      status ENUM('success', 'failure') NOT NULL DEFAULT 'success',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_user (user_id),
      INDEX idx_audit_created_at (created_at),
      INDEX idx_audit_module (module)
    );

    CREATE TABLE IF NOT EXISTS taxes (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      rate DECIMAL(5,2) NOT NULL,
      description TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pricings (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role_id CHAR(36) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      last_login DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id),
      INDEX idx_users_username (username),
      INDEX idx_users_email (email)
    );
  `;

  const alterSql = `
    ALTER TABLE payments
      ADD CONSTRAINT fk_payment_session FOREIGN KEY (session_id) REFERENCES parking_sessions(id) ON DELETE SET NULL;

    ALTER TABLE payments
      ADD CONSTRAINT fk_payment_ticket FOREIGN KEY (ticket_id) REFERENCES penalty_tickets(id) ON DELETE SET NULL;

    ALTER TABLE penalty_tickets
      ADD CONSTRAINT fk_ticket_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
  `;

  try {
    await conn.query(baseSql);
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    if (!message.includes('Duplicate foreign key constraint name')) {
      throw error;
    }
  }

  try {
    await conn.query(alterSql);
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    if (!message.includes('Duplicate foreign key constraint name')) {
      throw error;
    }
  }

  await conn.query(`USE \`${database}\``);

  const addColumn = async (table, column, ddl) => {
    const [c] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [database, table, column]
    );
    if (!c.length) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`);
      console.log(`[DB INIT] Added missing column ${table}.${column}`);
    }
  };

  await addColumn('penalty_tickets', 'note', '`note` TEXT NULL AFTER `remarks`');
  await addColumn('payments', 'receipt_number', '`receipt_number` VARCHAR(64) NULL AFTER `paid_at`');
  await addColumn('payments', 'receipt_date', '`receipt_date` DATETIME NULL AFTER `receipt_number`');

  await conn.query(
    `INSERT IGNORE INTO roles (id, name) VALUES
      ('11111111-1111-1111-1111-111111111111', 'owner'),
      ('22222222-2222-2222-2222-222222222222', 'inspector'),
      ('33333333-3333-3333-3333-333333333333', 'user')`
  );

  const [rows] = await conn.query('SHOW TABLES');
  console.log('[DB INIT] Tables created/verified successfully.');
  console.log(rows);
  await conn.end();
};

run().catch((err) => {
  console.error('[DB INIT] Failed:', err.message || err);
  process.exit(1);
});
