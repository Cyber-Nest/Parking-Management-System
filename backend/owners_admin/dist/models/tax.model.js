"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tax = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Tax extends sequelize_1.Model {
}
exports.Tax = Tax;
Tax.init({
    id: {
        type: sequelize_1.DataTypes.STRING(36),
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    rate: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage',
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'taxes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=tax.model.js.map