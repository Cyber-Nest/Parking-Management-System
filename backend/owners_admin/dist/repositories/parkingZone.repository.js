"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parkingZoneRepository = exports.ParkingZoneRepository = void 0;
const database_1 = require("../config/database");
class ParkingZoneRepository {
    async list(filters = {}) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 100;
        const offset = (page - 1) * limit;
        const values = [];
        let where = '';
        if (filters.q?.trim()) {
            where = 'WHERE parking_name LIKE ? OR id LIKE ? OR address LIKE ?';
            const term = `%${filters.q.trim()}%`;
            values.push(term, term, term);
        }
        const items = await (0, database_1.queryRows)(`SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id, status
       FROM parking_zones
       ${where}
       ORDER BY parking_name ASC
       LIMIT ? OFFSET ?`, [...values, limit, offset]);
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total FROM parking_zones ${where}`, values);
        return { items, total: Number(countRows[0]?.total ?? 0) };
    }
    async findById(id) {
        const rows = await (0, database_1.queryRows)(`SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id, status
       FROM parking_zones WHERE id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async create(params) {
        const id = params.id ?? `ZONE-${Date.now()}`;
        await (0, database_1.execute)(`INSERT INTO parking_zones (
        id, parking_name, address, image_url, hourly_rate,
        available_spots, total_spots, spot_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            params.parking_name.trim(),
            params.address.trim(),
            params.image_url,
            params.hourly_rate,
            params.available_spots,
            params.total_spots,
            params.spot_id,
            params.status ?? 'active',
        ]);
        return id;
    }
    async update(id, params) {
        const updates = [];
        const values = [];
        if (params.parking_name !== undefined) {
            updates.push('parking_name = ?');
            values.push(params.parking_name.trim());
        }
        if (params.address !== undefined) {
            updates.push('address = ?');
            values.push(params.address.trim());
        }
        if (params.image_url !== undefined) {
            updates.push('image_url = ?');
            values.push(params.image_url);
        }
        if (params.hourly_rate !== undefined) {
            updates.push('hourly_rate = ?');
            values.push(params.hourly_rate);
        }
        if (params.available_spots !== undefined) {
            updates.push('available_spots = ?');
            values.push(params.available_spots);
        }
        if (params.total_spots !== undefined) {
            updates.push('total_spots = ?');
            values.push(params.total_spots);
        }
        if (params.spot_id !== undefined) {
            updates.push('spot_id = ?');
            values.push(params.spot_id);
        }
        if (params.status !== undefined) {
            updates.push('status = ?');
            values.push(params.status);
        }
        if (updates.length === 0)
            return 0;
        values.push(id);
        const result = await (0, database_1.execute)(`UPDATE parking_zones SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows;
    }
    async remove(id) {
        const result = await (0, database_1.execute)('DELETE FROM parking_zones WHERE id = ?', [id]);
        return result.affectedRows;
    }
    async decrementAvailableSpots(id) {
        await (0, database_1.execute)(`UPDATE parking_zones
       SET available_spots = GREATEST(available_spots - 1, 0)
       WHERE id = ? AND available_spots > 0`, [id]);
    }
    async findCustomerSubZones(excludeId, limit = 6) {
        return (0, database_1.queryRows)(`SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id
       FROM parking_zones
       WHERE id != ? AND available_spots > 0 AND status = 'active'
       ORDER BY parking_name ASC
       LIMIT ?`, [excludeId, limit]);
    }
}
exports.ParkingZoneRepository = ParkingZoneRepository;
exports.parkingZoneRepository = new ParkingZoneRepository();
//# sourceMappingURL=parkingZone.repository.js.map