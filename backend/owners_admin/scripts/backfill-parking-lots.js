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

  try {
    const lotId = 'LOT-DEFAULT';

    const [[existing]] = await conn.query('SELECT id FROM parking_lots WHERE id = ? LIMIT 1', [lotId]);
    if (!existing) {
      await conn.query(
        `INSERT INTO parking_lots (id, owner_id, lot_name, address, image_url, qr_code_url)
         VALUES (?, NULL, ?, ?, NULL, NULL)`,
        [lotId, 'Default Lot', 'Backfilled default lot']
      );
      console.log('[BACKFILL] Created default parking lot:', lotId);
    } else {
      console.log('[BACKFILL] Default parking lot already exists:', lotId);
    }

    const [result] = await conn.query(
      'UPDATE parking_zones SET parking_lot_id = ? WHERE parking_lot_id IS NULL OR parking_lot_id = ""',
      [lotId],
    );

    const affected = result && (result.affectedRows ?? result.affectedRows === 0 ? result.affectedRows : result.length) ;
    console.log('[BACKFILL] parking_zones updated count:', affected);

    await conn.end();
  } catch (err) {
    console.error('[BACKFILL] Failed:', err.message || err);
    try { await conn.end(); } catch (e) {}
    process.exit(1);
  }
};

run().catch((err) => {
  console.error('[BACKFILL] Unhandled error:', err.message || err);
  process.exit(1);
});
