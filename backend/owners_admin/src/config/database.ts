import mysql, { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  database: process.env.DB_NAME ?? 'parksmart',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
};

const pool: Pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.username,
  password: dbConfig.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  decimalNumbers: true,
});

export const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'mysql',
  logging: false,
});

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  const conn = await pool.getConnection();
  conn.release();
  console.log(`[DB] Connected to MySQL (${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port})`);
};

export const queryRows = async <T>(
  sql: string,
  params?: any[]
): Promise<T[]> => {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
};

export const execute = async (
  sql: string,
  params?: any[]
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
};

export const getConnection = (): Promise<PoolConnection> => pool.getConnection();

export { pool };