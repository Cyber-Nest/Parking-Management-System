"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Officer = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Officer = database_1.sequelize.define('Officer', {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    full_name: sequelize_1.DataTypes.STRING,
    email: { type: sequelize_1.DataTypes.STRING, unique: true },
    phone: sequelize_1.DataTypes.STRING,
    status: { type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
}, {
    tableName: 'officers',
    timestamps: false,
});
//# sourceMappingURL=officer.model.js.map