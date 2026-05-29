// import serverless from "serverless-http";

// import app from "../src/app";
// import { connectDatabase } from "../src/config/database";

// let isConnected = false;

// const handler = serverless(app);

// export default async (req: any, res: any) => {
//   if (!isConnected) {
//     await connectDatabase();
//     isConnected = true;
//   }

//   return handler(req, res);
// };

// import serverless from "serverless-http";
// import app from "../src/app";

// const handler = serverless(app);

// export default async (req: any, res: any) => {
//   return handler(req, res);
// };

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
