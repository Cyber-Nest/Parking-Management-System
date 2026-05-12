"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficerRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class OfficerRepository {
    buildWhere(filters) {
        const conditions = [];
        const values = [];
        if (filters.q) {
            conditions.push('(full_name LIKE ? OR email LIKE ? OR badge_number LIKE ?)');
            values.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
        }
        if (filters.role) {
            conditions.push('role = ?');
            values.push(filters.role);
        }
        if (filters.status) {
            if (filters.status === 'ACTIVE') {
                conditions.push(`status = 'active'`);
            }
            else {
                conditions.push(`status <> 'active'`);
            }
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
          o.id, o.full_name, o.email, o.phone, o.badge_number, o.role, o.status, o.last_login_at, o.created_at,
          COALESCE(t.tickets_issued, 0) AS tickets_issued
       FROM officers o
       LEFT JOIN (
         SELECT officer_id, COUNT(*) AS tickets_issued
         FROM penalty_tickets
         GROUP BY officer_id
       ) t ON t.officer_id = o.id
       ${clause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`, [...values, filters.limit, offset]);
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM officers
       ${clause}`, values);
        return { items, total: countRows[0]?.total ?? 0 };
    }
    async summary() {
        const [totalRows, activeRows, disabledRows, ticketsTodayRows] = await Promise.all([
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM officers`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM officers WHERE status = 'active'`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM officers WHERE status <> 'active'`),
            (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM penalty_tickets WHERE DATE(date_issued) = CURDATE()`),
        ]);
        return {
            totalOfficers: totalRows[0]?.total ?? 0,
            activeOfficers: activeRows[0]?.total ?? 0,
            disabledOfficers: disabledRows[0]?.total ?? 0,
            ticketsIssuedToday: ticketsTodayRows[0]?.total ?? 0,
        };
    }
    async create(params) {
        const id = crypto_1.default.randomUUID();
        await (0, database_1.execute)(`INSERT INTO officers
      (id, created_by_admin_id, full_name, email, phone, password_hash, badge_number, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`, [
            id,
            params.createdByAdminId,
            params.fullName.trim(),
            params.email.toLowerCase().trim(),
            params.phone ?? null,
            params.passwordHash,
            params.badgeNumber ?? null,
            params.role,
        ]);
        return id;
    }
    async update(id, params) {
        const updates = [];
        const values = [];
        if (typeof params.fullName === 'string') {
            updates.push('full_name = ?');
            values.push(params.fullName.trim());
        }
        if (typeof params.phone === 'string') {
            updates.push('phone = ?');
            values.push(params.phone.trim());
        }
        if (typeof params.badgeNumber === 'string') {
            updates.push('badge_number = ?');
            values.push(params.badgeNumber.trim());
        }
        if (params.role) {
            updates.push('role = ?');
            values.push(params.role);
        }
        if (updates.length === 0)
            return 0;
        values.push(id);
        const result = await (0, database_1.execute)(`UPDATE officers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows;
    }
    async setUiStatus(id, status) {
        const next = status === 'ACTIVE' ? 'active' : 'inactive';
        const result = await (0, database_1.execute)(`UPDATE officers SET status = ?, updated_at = NOW() WHERE id = ?`, [next, id]);
        return result.affectedRows;
    }
    async remove(id) {
        const result = await (0, database_1.execute)(`DELETE FROM officers WHERE id = ?`, [id]);
        return result.affectedRows;
    }
}
exports.OfficerRepository = OfficerRepository;
//# sourceMappingURL=officer.repository.js.map