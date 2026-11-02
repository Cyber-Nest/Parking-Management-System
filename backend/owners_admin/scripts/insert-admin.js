require('dotenv').config();

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const { randomUUID } = require('crypto');

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`[Config] Missing required env var: ${key}`);
  return value;
};

async function main() {
  const email = required('ADMIN_EMAIL').trim().toLowerCase();
  const password = required('ADMIN_PASSWORD');
  const fullName = process.env.ADMIN_NAME?.trim() || 'ParkSmart Owner';
  const client = new MongoClient(required('MONGODB_URI'), { appName: 'ParkSmart-Admin-Seed' });

  try {
    await client.connect();
    const dbName = process.env.MONGODB_DATABASE || decodeURIComponent(new URL(process.env.MONGODB_URI).pathname.replace(/^\//, ''));
    if (!dbName) throw new Error('[Config] MONGODB_URI must include a database name or set MONGODB_DATABASE');
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    const indexDefinitions = require('../src/config/mongodb-index-definitions.json');
    for (const [collectionName, definitions] of Object.entries(indexDefinitions)) {
      await db.collection(collectionName).createIndexes(definitions);
    }
    const roles = db.collection('roles');
    await roles.updateOne({ name: 'owner' }, { $setOnInsert: { _id: 'ROLE-owner', name: 'owner', created_at: new Date(), updated_at: new Date() } }, { upsert: true });
    const role = await roles.findOne({ name: 'owner' });
    if (!role) throw new Error('Could not initialize the owner role');

    const admins = db.collection('admins');
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
    const now = new Date();
    const id = randomUUID();
    const result = await admins.updateOne(
      { email },
      {
        $set: { email, password_hash: passwordHash, full_name: fullName, role_id: String(role._id), is_active: true, updated_at: now },
        $setOnInsert: { _id: id, id, reset_token: null, reset_token_expires_at: null, last_login_at: null, created_at: now },
      },
      { upsert: true },
    );
    const admin = await admins.findOne({ email }, { projection: { _id: 1, email: 1, full_name: 1, is_active: 1 } });
    console.log(`[Seed] Owner admin ${result.upsertedCount ? 'created' : 'updated'}: ${admin.email} (${admin._id})`);
    console.log('[Seed] Password read from ADMIN_PASSWORD; it was not printed.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`[Seed] Failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
