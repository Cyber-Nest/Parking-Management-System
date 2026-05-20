"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSetting = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class SystemSetting extends sequelize_1.Model {
}
exports.SystemSetting = SystemSetting;
SystemSetting.init({
    id: {
        type: sequelize_1.DataTypes.STRING(36),
        primaryKey: true,
    },
    timezone: {
        type: sequelize_1.DataTypes.STRING(100),
        defaultValue: 'UTC',
    },
    language: {
        type: sequelize_1.DataTypes.STRING(50),
        defaultValue: 'en',
    },
    date_format: {
        type: sequelize_1.DataTypes.STRING(50),
        defaultValue: 'MM/DD/YYYY',
    },
    time_format: {
        type: sequelize_1.DataTypes.STRING(10),
        defaultValue: '12h',
    },
    week_starts_on: {
        type: sequelize_1.DataTypes.STRING(10),
        defaultValue: 'sunday',
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(10),
        defaultValue: 'USD',
    },
    session_expiry_display: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 30,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'system_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = SystemSetting;
//# sourceMappingURL=systemSetting.model.js.map