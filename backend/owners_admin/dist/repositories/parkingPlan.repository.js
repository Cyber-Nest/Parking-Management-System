"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkingPlanRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class ParkingPlanRepository {
    async list() {
        return (0, database_1.queryRows)(`SELECT id, name, price, duration, created_at, updated_at
       FROM parking_plans
       ORDER BY created_at DESC`);
    }
    async findById(id) {
        const rows = await (0, database_1.queryRows)(`SELECT id, name, price, duration, created_at, updated_at
       FROM parking_plans
       WHERE id = ?
       LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async create(params) {
        const id = crypto_1.default.randomUUID();
        await (0, database_1.execute)(`INSERT INTO parking_plans (id, name, price, duration)
       VALUES (?, ?, ?, ?)`, [id, params.name.trim(), params.price, params.duration]);
        return id;
    }
    async update(id, params) {
        const updates = [];
        const values = [];
        if (typeof params.name === 'string') {
            updates.push('name = ?');
            values.push(params.name.trim());
        }
        if (typeof params.price === 'number') {
            updates.push('price = ?');
            values.push(params.price);
        }
        if (typeof params.duration === 'number') {
            updates.push('duration = ?');
            values.push(params.duration);
        }
        if (updates.length === 0)
            return 0;
        values.push(id);
        const result = await (0, database_1.execute)(`UPDATE parking_plans
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = ?`, values);
        return result.affectedRows;
    }
    async remove(id) {
        const result = await (0, database_1.execute)(`DELETE FROM parking_plans WHERE id = ?`, [id]);
        return result.affectedRows;
    }
}
exports.ParkingPlanRepository = ParkingPlanRepository;
//# sourceMappingURL=parkingPlan.repository.js.map