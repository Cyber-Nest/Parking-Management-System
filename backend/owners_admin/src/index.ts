import dotenv from "dotenv";
import app from "./app";
import { env } from "./config/env";
import { closeMongoDatabase, connectMongoDatabase } from "./config/mongodb";
import { ensureMongoIndexes } from "./config/mongodb-indexes";
import { getCloudinarySetupError, isCloudinaryConfigured } from "./services/cloudinary.service";

dotenv.config();
let httpServer: ReturnType<typeof app.listen> | undefined;

const startServer = async (): Promise<void> => {
  try {
    const mongoDb = await connectMongoDatabase();
    await ensureMongoIndexes(mongoDb);
    httpServer = app.listen(env.port, () => {
      console.log(`ParkSmart Owners Admin API running at http://localhost:${env.port}`);
      const cloudinarySetupError = getCloudinarySetupError();
      console.log(isCloudinaryConfigured()
        ? "[Cloudinary] Media uploads enabled (URLs stored in database)"
        : cloudinarySetupError
          ? `[Cloudinary] NOT ready — ${cloudinarySetupError}`
          : "[Cloudinary] NOT configured — set CLOUDINARY_URL in .env for media uploads");
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Startup] Failed to start server: ${message}`);
    process.exit(1);
  }
};

const shutdown = (signal: string): void => {
  console.log(`[Shutdown] Received ${signal}; closing MongoDB connection`);
  const closeServer = httpServer
    ? new Promise<void>((resolve, reject) => httpServer?.close(error => error ? reject(error) : resolve()))
    : Promise.resolve();
  void closeServer.then(closeMongoDatabase).then(() => process.exit(0)).catch(error => {
    console.error(`[Shutdown] Failed to close cleanly: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exit(1);
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
void startServer();
