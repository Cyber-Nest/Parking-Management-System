require('dotenv').config();

const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

const batchSizeArg = process.argv.find((arg) => arg.startsWith('--batch-size='));
const batchSize = batchSizeArg ? Number(batchSizeArg.split('=')[1]) : 500;
const dryRun = process.argv.includes('--dry-run');

if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 10000) {
  throw new Error('--batch-size must be an integer between 1 and 10000');
}

const quoteIdentifier = (value) => `\`${String(value).replace(/`/g, '``')}\``;
const makeStableId = (row) => crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('[Config] Missing required env var: MONGODB_URI');
  const sourceDatabase = process.env.DB_NAME;
  if (!sourceDatabase) throw new Error('[Config] Missing required env var: DB_NAME (MySQL source database)');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: sourceDatabase,
    decimalNumbers: true,
    timezone: '+00:00',
  });
  const mongoClient = new MongoClient(uri, { appName: 'ParkSmart-Data-Migration' });

  try {
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DATABASE || decodeURIComponent(new URL(uri).pathname.replace(/^\//, ''));
    if (!dbName) throw new Error('[Config] MONGODB_URI must include a database name or set MONGODB_DATABASE');
    const mongoDb = mongoClient.db(dbName);
    await mongoDb.command({ ping: 1 });

    const [tableRows] = await connection.query('SHOW TABLES');
    const tableColumn = Object.keys(tableRows[0] || {})[0];
    if (!tableColumn) throw new Error(`MySQL source database "${sourceDatabase}" has no tables`);
    const tables = tableRows.map((row) => row[tableColumn]).sort((a, b) => (a === 'roles' ? -1 : b === 'roles' ? 1 : a.localeCompare(b)));
    const roleIdMap = new Map();
    console.log(`[Migration] ${dryRun ? 'Dry run: validating' : 'Copying'} ${tables.length} source tables in batches of ${batchSize}`);

    for (const table of tables) {
      const safeTable = quoteIdentifier(table);
      const [columnRows] = await connection.query(`SHOW COLUMNS FROM ${safeTable}`);
      const columns = columnRows.map((column) => column.Field);
      const [primaryRows] = await connection.query(`SHOW KEYS FROM ${safeTable} WHERE Key_name = 'PRIMARY'`);
      const sortColumns = primaryRows.length
        ? primaryRows.sort((a, b) => a.Seq_in_index - b.Seq_in_index).map((row) => row.Column_name)
        : columns;
      const orderClause = sortColumns.map(quoteIdentifier).join(', ');
      const [[{ sourceCount }]] = await connection.query(`SELECT COUNT(*) AS sourceCount FROM ${safeTable}`);
      const destination = mongoDb.collection(table);
      let copied = 0;

      for (let offset = 0; offset < sourceCount; offset += batchSize) {
        const [rows] = await connection.query(
          `SELECT * FROM ${safeTable} ORDER BY ${orderClause} LIMIT ? OFFSET ?`,
          [batchSize, offset],
        );
        if (!rows.length) break;
        if (!dryRun) {
          const operations = rows.map((row, rowIndex) => {
            const original = { ...row };
            if (original.role_id !== null && original.role_id !== undefined && roleIdMap.has(String(original.role_id))) {
              original.role_id = roleIdMap.get(String(original.role_id));
            }
            const primaryKey = primaryRows.map((key) => key.Column_name);
            const primaryValue = primaryKey.length === 1 ? original[primaryKey[0]] : undefined;
            const id = original.id !== null && original.id !== undefined
              ? String(original.id)
              : primaryValue !== null && primaryValue !== undefined
                ? String(primaryValue)
                : primaryKey.length > 1
                  ? makeStableId(Object.fromEntries(primaryKey.map((key) => [key, original[key]])))
                  : makeStableId({ table, row: original, sourceOrdinal: offset + rowIndex });
            if (table === 'roles' && original.id !== null && original.id !== undefined && original.name) {
              roleIdMap.set(String(original.id), String(original.id));
              const existingRole = mongoDb.collection('roles').findOne({ name: original.name });
              return existingRole.then((existing) => {
                const targetId = String(existing?._id ?? id);
                roleIdMap.set(String(original.id), targetId);
                const roleDocument = { ...original, _id: targetId };
                return { updateOne: { filter: { name: original.name }, update: { $setOnInsert: roleDocument }, upsert: true } };
              });
            }
            return {
              updateOne: {
                filter: { _id: id },
                update: { $setOnInsert: { ...original, _id: id } },
                upsert: true,
              },
            };
          });
          await destination.bulkWrite(await Promise.all(operations), { ordered: false });
        }
        copied += rows.length;
        console.log(`[Migration] ${table}: ${copied}/${sourceCount}${dryRun ? ' validated' : ' copied/upserted'}`);
      }

      const destinationCount = dryRun ? undefined : await destination.countDocuments();
      if (copied !== sourceCount) throw new Error(`[Migration] ${table}: source row count changed during copy (${sourceCount} expected, ${copied} read); rerun after writes settle`);
      if (destinationCount !== undefined && destinationCount < sourceCount) {
        throw new Error(`[Migration] ${table}: destination has ${destinationCount} documents for ${sourceCount} source rows`);
      }
      console.log(`[Migration] ${table}: complete (${sourceCount} source rows${destinationCount === undefined ? '' : `; ${destinationCount} destination documents`})`);
    }
    console.log(`[Migration] ${dryRun ? 'Validation' : 'Copy'} completed. The MySQL source was not modified.`);
  } finally {
    await Promise.allSettled([connection.end(), mongoClient.close()]);
  }
}

main().catch((error) => {
  console.error(`[Migration] Failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
