"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRepository = exports.BookingRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class BookingRepository {
    async createBooking(data) {
        const id = crypto_1.default.randomUUID();
        const { booking_reference, parking_zone_id, parking_name, parking_location, customer_email, vehicle_model, vehicle_plate_number, vehicle_color, start_time, end_time, duration_minutes, duration_label, parking_plan_id, hourly_rate, base_price, tax_amount, service_fee, total_price, currency, spot_id, zone_name, grace_period_minutes, metadata, stripe_payment_intent_id, } = data;
        await (0, database_1.execute)(`INSERT INTO bookings (
        id, booking_reference, parking_zone_id, parking_name, parking_location,
        customer_email, vehicle_model, vehicle_plate_number, vehicle_color,
        start_time, end_time, duration_minutes, duration_label, parking_plan_id, hourly_rate,
        base_price, tax_amount, service_fee, total_price, currency, spot_id,
        zone_name, booking_status, payment_status, grace_period_minutes,
        stripe_payment_intent_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?, ?)`, [
            id,
            booking_reference,
            parking_zone_id,
            parking_name,
            parking_location ?? null,
            customer_email,
            vehicle_model,
            vehicle_plate_number,
            vehicle_color ?? null,
            start_time,
            end_time,
            duration_minutes,
            duration_label ?? null,
            parking_plan_id ?? null,
            hourly_rate,
            base_price,
            tax_amount ?? 0,
            service_fee ?? 0,
            total_price,
            currency ?? 'CAD',
            spot_id ?? null,
            zone_name ?? null,
            grace_period_minutes ?? 15,
            stripe_payment_intent_id ?? null,
            JSON.stringify(metadata ?? {}),
        ]);
        return this.findBookingById(id);
    }
    async findBookingById(id) {
        const rows = await (0, database_1.queryRows)('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
        return rows[0] ?? null;
    }
    async findByReference(reference) {
        const rows = await (0, database_1.queryRows)('SELECT * FROM bookings WHERE booking_reference = ? LIMIT 1', [reference]);
        return rows[0] ?? null;
    }
    async findByEmail(email, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM bookings WHERE customer_email = ?', [email]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM bookings WHERE customer_email = ?
       ORDER BY start_time DESC LIMIT ? OFFSET ?`, [email, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async findByPlateNumber(plate) {
        return (0, database_1.queryRows)('SELECT * FROM bookings WHERE vehicle_plate_number = ? ORDER BY start_time DESC', [
            plate,
        ]);
    }
    async findByStatus(status, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM bookings WHERE booking_status = ?', [status]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM bookings WHERE booking_status = ?
       ORDER BY start_time DESC LIMIT ? OFFSET ?`, [status, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async findActiveBookings() {
        return (0, database_1.queryRows)(`SELECT * FROM bookings
       WHERE booking_status = 'active' AND end_time > NOW()
       ORDER BY start_time DESC`);
    }
    async findByDateRange(startDate, endDate, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM bookings WHERE start_time BETWEEN ? AND ?', [startDate, endDate]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM bookings WHERE start_time BETWEEN ? AND ?
       ORDER BY start_time DESC LIMIT ? OFFSET ?`, [startDate, endDate, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async updateBooking(id, data) {
        if (Object.keys(data).length === 0) {
            return this.findBookingById(id);
        }
        const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await (0, database_1.execute)(`UPDATE bookings SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
        return this.findBookingById(id);
    }
    async confirmBooking(id, paymentId) {
        await (0, database_1.execute)(`UPDATE bookings
       SET booking_status = 'confirmed', payment_status = 'paid', payment_id = ?, updated_at = NOW()
       WHERE id = ?`, [paymentId, id]);
        return this.findBookingById(id);
    }
    async markAsActive(id) {
        await (0, database_1.execute)(`UPDATE bookings SET booking_status = 'active', updated_at = NOW() WHERE id = ?`, [id]);
        return this.findBookingById(id);
    }
    async markAsCompleted(id) {
        await (0, database_1.execute)(`UPDATE bookings SET booking_status = 'completed', updated_at = NOW() WHERE id = ?`, [id]);
        return this.findBookingById(id);
    }
    async getBookingStats() {
        return (0, database_1.queryRows)(`SELECT booking_status, COUNT(*) AS count, SUM(total_price) AS total_revenue
       FROM bookings GROUP BY booking_status`);
    }
    async getTodayBookings() {
        const rows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS booking_count, COALESCE(SUM(total_price), 0) AS total_revenue
       FROM bookings WHERE DATE(start_time) = CURDATE()`);
        return rows[0] ?? { booking_count: 0, total_revenue: 0 };
    }
    async deleteBooking(id) {
        return (0, database_1.execute)('DELETE FROM bookings WHERE id = ?', [id]);
    }
}
exports.BookingRepository = BookingRepository;
exports.bookingRepository = new BookingRepository();
//# sourceMappingURL=booking.repository.js.map