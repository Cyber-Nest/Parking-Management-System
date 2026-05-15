"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Ticket = database_1.sequelize.define("Ticket", {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    ticket_number: sequelize_1.DataTypes.STRING,
    license_plate: sequelize_1.DataTypes.STRING,
    reason: sequelize_1.DataTypes.STRING,
    amount: sequelize_1.DataTypes.FLOAT,
    status: sequelize_1.DataTypes.ENUM("unpaid", "paid", "cancelled", "disputed", "resolved"),
    note: sequelize_1.DataTypes.TEXT,
}, {
    tableName: 'penalty_tickets',
    timestamps: false,
});
//# sourceMappingURL=ticket.model.js.map