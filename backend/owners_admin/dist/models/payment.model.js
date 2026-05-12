"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Payment = database_1.sequelize.define("Payment", {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    amount: sequelize_1.DataTypes.FLOAT,
    payment_method: sequelize_1.DataTypes.ENUM("credit_card", "debit_card", "apple_pay", "visa", "mastercard", "amex"),
    payment_type: sequelize_1.DataTypes.ENUM("parking", "penalty", "extension"),
    status: sequelize_1.DataTypes.ENUM("pending", "success", "failed", "refunded")
}, {
    tableName: 'payments',
    timestamps: false,
});
//# sourceMappingURL=payment.model.js.map