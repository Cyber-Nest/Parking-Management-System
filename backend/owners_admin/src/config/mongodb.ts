import { Db, MongoClient } from "mongodb";

let client: MongoClient | undefined;
let database: Db | undefined;
let connectPromise: Promise<Db> | undefined;

const mongoDatabaseName = (): string | undefined => {
  const configured = process.env.MONGODB_DATABASE?.trim();
  if (configured) return configured;
  const uri = process.env.MONGODB_URI;
  if (!uri) return undefined;
  try {
    const path = new URL(uri).pathname.replace(/^\//, "");
    return path ? decodeURIComponent(path) : undefined;
  } catch {
    throw new Error("[Config] MONGODB_URI is not a valid MongoDB connection URI");
  }
};

export const connectMongoDatabase = async (): Promise<Db> => {
  if (database) return database;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("[Config] Missing required env var: MONGODB_URI");
    const dbName = mongoDatabaseName();
    if (!dbName) throw new Error("[Config] MONGODB_URI must include a database name or set MONGODB_DATABASE");

    const mongoClient = new MongoClient(uri, {
      appName: "ParkSmart",
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 10000),
    });
    try {
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      await db.command({ ping: 1 });
      client = mongoClient;
      database = db;
      console.log(`[DB] Connected to MongoDB database "${dbName}"`);
      return db;
    } catch (error) {
      await mongoClient.close().catch(() => undefined);
      throw new Error(`[DB] MongoDB connection failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = undefined;
  }
};

export const getMongoDatabase = (): Db => {
  if (!database) throw new Error("MongoDB is not connected; call connectMongoDatabase() before accessing collections");
  return database;
};

export const closeMongoDatabase = async (): Promise<void> => {
  const currentClient = client;
  client = undefined;
  database = undefined;
  if (currentClient) await currentClient.close();
};
