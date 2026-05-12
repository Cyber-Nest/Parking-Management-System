"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class SessionRepository {
    buildWhere(filters) {
        const conditions = [];
        const values = [];
        if (filters.q) {
            conditions.push('license_plate LIKE ?');
            values.push(`%${filters.q}%`);
        }
        if (filters.status) {
            conditions.push('status = ?');
            values.push(filters.status);
        }
        if (filters.from) {
            conditions.push('start_time >= ?');
            values.push(filters.from);
        }
        if (filters.to) {
            conditions.push('end_time <= ?');
            values.push(filters.to);
        }
        return {
            clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
            values,
        };
    }
    async list(filters) {
        const { clause, values } = this.buildWhere(filters);
        const offset = (filters.page - 1) * filters.limit;
        const items = await (0, database_1.queryRows)(`SELECT
        id, user_id, vehicle_id, license_plate, plan_id, plan_name,
        start_time, end_time, duration_minutes, status, notes, created_by_officer, created_at
       FROM parking_sessions
       ${clause}
       ORDER BY start_time DESC
       LIMIT ? OFFSET ?`, [...values, filters.limit, offset]);
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM parking_sessions
       ${clause}`, values);
        return { items, total: countRows[0]?.total ?? 0 };
    }
    async summary() {
        const [todayRows, activeRows, expiredRows, extendedRows, cancelledRows] = await Promise.all([
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_sessions WHERE DATE(start_time) = CURDATE()`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'active'`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'expired'`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'extended'`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'cancelled'`),
        ]);
        return {
            totalToday: todayRows[0]?.total ?? 0,
            activeCount: activeRows[0]?.total ?? 0,
            expiredCount: expiredRows[0]?.total ?? 0,
            extendedCount: extendedRows[0]?.total ?? 0,
            cancelledCount: cancelledRows[0]?.total ?? 0,
        };
    }
    async create(params) {
        const id = crypto_1.default.randomUUID();
        await (0, database_1.execute)(`INSERT INTO parking_sessions
      (id, user_id, vehicle_id, license_plate, plan_id, plan_name, start_time, end_time, duration_minutes, status, notes, created_by_officer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            params.userId ?? null,
            params.vehicleId ?? null,
            params.licensePlate.trim().toUpperCase(),
            params.planId ?? null,
            params.planName ?? null,
            params.startTime,
            params.endTime,
            params.durationMinutes,
            params.status ?? 'active',
            params.notes ?? null,
            params.createdByOfficer ?? null,
        ]);
        return id;
    }
}
exports.SessionRepository = SessionRepository;
//# sourceMappingURL=session.repository.js.map