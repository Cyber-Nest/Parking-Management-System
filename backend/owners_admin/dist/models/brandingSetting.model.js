"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingSetting = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class BrandingSetting extends sequelize_1.Model {
}
exports.BrandingSetting = BrandingSetting;
BrandingSetting.init({
    id: {
        type: sequelize_1.DataTypes.STRING(36),
        primaryKey: true,
    },
    system_name: {
        type: sequelize_1.DataTypes.STRING(150),
        defaultValue: 'ParkSmart',
    },
    theme_color: {
        type: sequelize_1.DataTypes.STRING(20),
        defaultValue: '#0F766E',
    },
    dark_mode: {
        type: sequelize_1.DataTypes.STRING(20),
        defaultValue: 'system',
    },
    logo_url: {
        type: sequelize_1.DataTypes.TEXT,
    },
    favicon_url: {
        type: sequelize_1.DataTypes.TEXT,
    },
    sidebar_collapsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'branding_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = BrandingSetting;
//# sourceMappingURL=brandingSetting.model.js.map