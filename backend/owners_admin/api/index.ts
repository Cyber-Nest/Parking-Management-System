import app from "../src/app";
import { connectDatabase } from "../src/config/database";

let isDbConnected = false;

module.exports = async (req: any, res: any) => {
  if (!isDbConnected) {
    await connectDatabase();
    isDbConnected = true;
  }

  return app(req, res);
};
