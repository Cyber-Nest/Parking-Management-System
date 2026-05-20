"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyRuleRepository = void 0;
const database_1 = require("../config/database");
class PenaltyRuleRepository {
    async list(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.max(1, Math.min(100, query.limit || 10));
        const offset = (page - 1) * limit;
        let sql = 'SELECT * FROM penalty_rules WHERE 1=1';
        const params = [];
        if (query.status) {
            sql += ' AND status = ?';
            params.push(query.status);
        }
        if (query.q) {
            sql += ' AND (violation LIKE ? OR code LIKE ?)';
            params.push(`%${query.q}%`, `%${query.q}%`);
        }
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM penalty_rules WHERE 1=1 ${query.status ? 'AND status = ?' : ''} ${query.q ? 'AND (violation LIKE ? OR code LIKE ?)' : ''}`, query.status ? (query.q ? [query.status, `%${query.q}%`, `%${query.q}%`] : [query.status]) : query.q ? [`%${query.q}%`, `%${query.q}%`] : []);
        const rows = await (0, database_1.queryRows)(sql + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        const total = countRows[0]?.total ?? 0;
        return {
            items: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getById(id) {
        const rows = await (0, database_1.queryRows)('SELECT * FROM penalty_rules WHERE id = ?', [id]);
        return rows[0] ?? null;
    }
    async create(rule) {
        const { id, violation, code, amount, grace_minutes, description, status } = rule;
        await (0, database_1.execute)('INSERT INTO penalty_rules (id, violation, code, amount, grace_minutes, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, violation, code, amount, grace_minutes ?? 0, description ?? null, status]);
        return this.getById(id);
    }
    async update(id, updates) {
        const fields = [];
        const values = [];
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });
        if (!fields.length)
            return 0;
        values.push(id);
        const result = await (0, database_1.execute)(`UPDATE penalty_rules SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows ?? 0;
    }
    async delete(id) {
        const result = await (0, database_1.execute)('DELETE FROM penalty_rules WHERE id = ?', [id]);
        return result.affectedRows ?? 0;
    }
}
exports.PenaltyRuleRepository = PenaltyRuleRepository;
exports.default = PenaltyRuleRepository;
//# sourceMappingURL=penaltyRule.repository.js.map