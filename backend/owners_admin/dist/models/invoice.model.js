"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Invoice = database_1.sequelize.define("Invoice", {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    // Invoice Details
    invoice_number: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
    invoice_date: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
    due_date: { type: sequelize_1.DataTypes.DATE },
    // Customer Info
    customer_email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    customer_name: { type: sequelize_1.DataTypes.STRING },
    vehicle_plate_number: { type: sequelize_1.DataTypes.STRING },
    vehicle_model: { type: sequelize_1.DataTypes.STRING },
    vehicle_color: { type: sequelize_1.DataTypes.STRING },
    // Invoice Items
    item_description: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    item_type: {
        type: sequelize_1.DataTypes.ENUM("parking_booking", "penalty", "extension", "adjustment"),
        allowNull: false
    },
    quantity: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 1 },
    unit_price: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    // Charges & Discounts
    tax_amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tax_rate: { type: sequelize_1.DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    discount_amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    discount_reason: { type: sequelize_1.DataTypes.STRING },
    service_fee: { type: sequelize_1.DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    // Total
    total_amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: sequelize_1.DataTypes.STRING, defaultValue: "CAD" },
    // Payment & Status
    payment_status: {
        type: sequelize_1.DataTypes.ENUM("unpaid", "partial", "paid", "overdue", "cancelled"),
        defaultValue: "unpaid"
    },
    paid_amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    paid_date: { type: sequelize_1.DataTypes.DATE },
    // Related IDs
    booking_id: { type: sequelize_1.DataTypes.UUID },
    penalty_id: { type: sequelize_1.DataTypes.UUID },
    transaction_id: { type: sequelize_1.DataTypes.UUID },
    // Status & Notes
    status: {
        type: sequelize_1.DataTypes.ENUM("draft", "issued", "sent", "viewed", "paid", "cancelled"),
        defaultValue: "draft"
    },
    notes: { type: sequelize_1.DataTypes.TEXT },
    payment_terms: { type: sequelize_1.DataTypes.STRING, defaultValue: "Due upon receipt" },
    // Parking Details (if applicable)
    parking_zone: { type: sequelize_1.DataTypes.STRING },
    parking_location: { type: sequelize_1.DataTypes.STRING },
    start_time: { type: sequelize_1.DataTypes.DATE },
    end_time: { type: sequelize_1.DataTypes.DATE },
    duration_minutes: { type: sequelize_1.DataTypes.INTEGER },
    // File Info
    pdf_file_path: { type: sequelize_1.DataTypes.STRING },
    file_generated_at: { type: sequelize_1.DataTypes.DATE },
    download_count: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    last_downloaded_at: { type: sequelize_1.DataTypes.DATE },
    // Metadata
    metadata: { type: sequelize_1.DataTypes.JSON },
}, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=invoice.model.js.map