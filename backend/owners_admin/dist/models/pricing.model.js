"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pricing = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Pricing extends sequelize_1.Model {
}
exports.Pricing = Pricing;
Pricing.init({
    id: {
        type: sequelize_1.DataTypes.STRING(36),
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    base_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    additional_fees: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    tax_id: {
        type: sequelize_1.DataTypes.STRING(36),
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'pricings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=pricing.model.js.map