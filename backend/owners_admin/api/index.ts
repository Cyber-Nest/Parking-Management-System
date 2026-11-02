import app from "../src/app";
import { connectMongoDatabase } from "../src/config/mongodb";
import { ensureMongoIndexes } from "../src/config/mongodb-indexes";

let isDbConnected = false;

module.exports = async (req: any, res: any) => {
  if (!isDbConnected) {
    const db = await connectMongoDatabase();
    await ensureMongoIndexes(db);
    isDbConnected = true;
  }

  return app(req, res);
};
