import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { Sequelize } from 'sequelize';
declare const pool: Pool;
export declare const sequelize: Sequelize;
export declare const connectDatabase: () => Promise<void>;
export declare const queryRows: <T>(sql: string, params?: any[]) => Promise<T[]>;
export declare const execute: (sql: string, params?: any[]) => Promise<ResultSetHeader>;
export declare const getConnection: () => Promise<PoolConnection>;
export { pool };
//# sourceMappingURL=database.d.ts.map