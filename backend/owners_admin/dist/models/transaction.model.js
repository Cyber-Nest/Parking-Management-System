"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Transaction = database_1.sequelize.define("Transaction", {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    // Transaction Details
    transaction_reference: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
    amount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: sequelize_1.DataTypes.STRING, defaultValue: "CAD" },
    // Payment Method
    payment_method: {
        type: sequelize_1.DataTypes.ENUM("credit_card", "debit_card", "apple_pay", "google_pay", "stripe"),
        allowNull: false
    },
    payment_gateway: { type: sequelize_1.DataTypes.STRING, defaultValue: "stripe" },
    stripe_payment_intent_id: { type: sequelize_1.DataTypes.STRING },
    // Transaction Type
    transaction_type: {
        type: sequelize_1.DataTypes.ENUM("parking_booking", "penalty_payment", "booking_extension", "refund", "adjustment"),
        allowNull: false
    },
    // Status
    status: {
        type: sequelize_1.DataTypes.ENUM("initiated", "processing", "completed", "failed", "refunded", "cancelled"),
        defaultValue: "initiated"
    },
    // Related IDs
    booking_id: { type: sequelize_1.DataTypes.UUID },
    penalty_id: { type: sequelize_1.DataTypes.UUID },
    user_email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    // Response Details
    response_code: { type: sequelize_1.DataTypes.STRING },
    response_message: { type: sequelize_1.DataTypes.TEXT },
    // Timestamps
    initiated_at: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
    completed_at: { type: sequelize_1.DataTypes.DATE },
    failed_at: { type: sequelize_1.DataTypes.DATE },
    // Metadata
    metadata: { type: sequelize_1.DataTypes.JSON },
    ip_address: { type: sequelize_1.DataTypes.STRING },
    user_agent: { type: sequelize_1.DataTypes.TEXT },
}, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=transaction.model.js.map