"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Booking = database_1.sequelize.define("Booking", {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    // Booking Details
    booking_reference: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
    parking_zone_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    parking_name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    parking_location: { type: sequelize_1.DataTypes.STRING },
    // Customer Details
    customer_email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    vehicle_model: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    vehicle_plate_number: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    vehicle_color: { type: sequelize_1.DataTypes.STRING },
    // Time Details
    start_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    end_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    duration_minutes: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    duration_label: { type: sequelize_1.DataTypes.STRING },
    // Pricing
    hourly_rate: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    base_price: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    tax_amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    service_fee: { type: sequelize_1.DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total_price: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: sequelize_1.DataTypes.STRING, defaultValue: "CAD" },
    // Parking Details
    spot_id: { type: sequelize_1.DataTypes.STRING },
    zone_name: { type: sequelize_1.DataTypes.STRING },
    // Status
    booking_status: {
        type: sequelize_1.DataTypes.ENUM("pending", "confirmed", "active", "completed", "extended", "cancelled"),
        defaultValue: "pending"
    },
    // Payment
    payment_status: {
        type: sequelize_1.DataTypes.ENUM("unpaid", "pending", "paid", "failed", "refunded"),
        defaultValue: "unpaid"
    },
    payment_id: { type: sequelize_1.DataTypes.UUID },
    stripe_payment_intent_id: { type: sequelize_1.DataTypes.STRING },
    // Extra Features
    allow_extension: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    total_extensions: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    // Violation
    grace_period_minutes: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 15 },
    has_violation: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    violation_reason: { type: sequelize_1.DataTypes.STRING },
    penalty_issued_at: { type: sequelize_1.DataTypes.DATE },
    // Notes
    notes: { type: sequelize_1.DataTypes.TEXT },
    // Metadata
    metadata: { type: sequelize_1.DataTypes.JSON },
}, {
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=booking.model.js.map