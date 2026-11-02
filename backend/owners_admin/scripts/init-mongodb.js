require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('[Config] Missing required env var: MONGODB_URI');
  const client = new MongoClient(uri, { appName: 'ParkSmart-Database-Init' });
  try {
    await client.connect();
    const dbName = process.env.MONGODB_DATABASE || decodeURIComponent(new URL(uri).pathname.replace(/^\//, ''));
    if (!dbName) throw new Error('[Config] MONGODB_URI must include a database name or set MONGODB_DATABASE');
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    const indexes = require('../src/config/mongodb-index-definitions.json');
    for (const [collectionName, definitions] of Object.entries(indexes)) {
      await db.collection(collectionName).createIndexes(definitions);
    }
    const roles = db.collection('roles');
    for (const name of ['owner', 'inspector', 'user']) {
      await roles.updateOne(
        { name },
        { $setOnInsert: { _id: `ROLE-${name}`, name, created_at: new Date(), updated_at: new Date() } },
        { upsert: true },
      );
    }
    console.log(`[DB] MongoDB initialized (${dbName}); built-in roles are present`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`[DB] MongoDB initialization failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
