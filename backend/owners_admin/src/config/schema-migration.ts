import { getConnection } from "./database";
import { RowDataPacket } from "mysql2";

export const ensureParkingPlanSchema = async (): Promise<void> => {
  const conn = await getConnection();

  try {
    const [rows] = await conn.query<(RowDataPacket & { COLUMN_NAME: string })[]>(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'parking_plans'
         AND COLUMN_NAME = 'parking_lot_id'`
    );

    if (rows.length === 0) {
      await conn.query(
        `ALTER TABLE parking_plans ADD COLUMN parking_lot_id VARCHAR(60) NULL AFTER \`status\``,
      );
      console.log("[DB] Added missing parking_plans.parking_lot_id column");
    } else {
      console.log("[DB] parking_plans.parking_lot_id already exists");
    }
  } finally {
    conn.release();
  }
};

export const ensureSystemSettingsSchema = async (): Promise<void> => {
  const conn = await getConnection();

  try {
    const [rows] = await conn.query<(RowDataPacket & { COLUMN_NAME: string })[]>(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'system_settings'
         AND COLUMN_NAME = 'parking_lot_id'`
    );

    if (rows.length === 0) {
      await conn.query(
        `ALTER TABLE system_settings ADD COLUMN parking_lot_id VARCHAR(60) NULL UNIQUE AFTER id`,
      );
      console.log("[DB] Added missing system_settings.parking_lot_id column");
    } else {
      console.log("[DB] system_settings.parking_lot_id already exists");
    }
  } finally {
    conn.release();
  }
};
