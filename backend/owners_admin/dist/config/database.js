"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.getConnection = exports.execute = exports.queryRows = exports.connectDatabase = exports.sequelize = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    database: process.env.DB_NAME ?? 'parksmart',
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
};
const pool = promise_1.default.createPool({
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
exports.pool = pool;
exports.sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: false,
});
const connectDatabase = async () => {
    await exports.sequelize.authenticate();
    const conn = await pool.getConnection();
    conn.release();
    console.log(`[DB] Connected to MySQL (${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port})`);
};
exports.connectDatabase = connectDatabase;
const queryRows = async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
};
exports.queryRows = queryRows;
const execute = async (sql, params) => {
    const [result] = await pool.execute(sql, params);
    return result;
};
exports.execute = execute;
const getConnection = () => pool.getConnection();
exports.getConnection = getConnection;
//# sourceMappingURL=database.js.map