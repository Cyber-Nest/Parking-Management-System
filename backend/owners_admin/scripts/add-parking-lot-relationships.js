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
  });

  try {
    console.log('Starting migration: add-parking-lot-relationships...');

    const columnExists = async (table, column) => {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [database, table, column]
      );
      return (rows[0] && rows[0].c) ? rows[0].c > 0 : false;
    };

    const constraintExists = async (table, constraintName) => {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
        [database, table, constraintName]
      );
      return (rows[0] && rows[0].c) ? rows[0].c > 0 : false;
    };

    // Helper to add a column and constraint safely
    const addColumnAndFk = async (table, columnDef, afterColumn, fkName, fkSql) => {
      const colNameMatch = /^(?:`?\w+`?\s+)?(\w+)/i.exec(columnDef.trim());
      const colName = colNameMatch ? colNameMatch[1] : null;
      if (!colName) throw new Error('Unable to parse column name from: ' + columnDef);

      const colExists = await columnExists(table, colName);
      if (!colExists) {
        console.log(`Adding column ${colName} to ${table}...`);
        await conn.execute(`ALTER TABLE ${database}.${table} ADD COLUMN ${columnDef} AFTER ${afterColumn}`);
      } else {
        console.log(`Column ${colName} already exists on ${table}, skipping add`);
      }

      if (fkName && fkSql) {
        const fkExists = await constraintExists(table, fkName);
        if (!fkExists) {
          console.log(`Adding FK ${fkName} on ${table}...`);
          await conn.execute(`ALTER TABLE ${database}.${table} ADD CONSTRAINT ${fkName} ${fkSql}`);
        } else {
          console.log(`FK ${fkName} already exists on ${table}, skipping add`);
        }
      }
    };

    // officers
    await addColumnAndFk(
      'officers',
      'parking_lot_id VARCHAR(60) NULL',
      'badge_number',
      'fk_officer_parking_lot',
      'FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE SET NULL'
    );

    // system_settings
    await addColumnAndFk(
      'system_settings',
      'parking_lot_id VARCHAR(60) NULL',
      'currency',
      'fk_settings_parking_lot',
      'FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE'
    );

    // taxes
    await addColumnAndFk(
      'taxes',
      'parking_lot_id VARCHAR(60) NULL',
      'is_active',
      'fk_taxes_parking_lot',
      'FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE'
    );

    // pricings
    await addColumnAndFk(
      'pricings',
      'parking_lot_id VARCHAR(60) NULL',
      'is_active',
      'fk_pricings_parking_lot',
      'FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE'
    );

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', (error && error.message) || error);
    process.exit(1);
  } finally {
    await conn.end();
  }
};

run();
