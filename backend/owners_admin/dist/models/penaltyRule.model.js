"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyRule = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PenaltyRule extends sequelize_1.Model {
}
exports.PenaltyRule = PenaltyRule;
PenaltyRule.init({
    id: {
        type: sequelize_1.DataTypes.STRING(36),
        primaryKey: true,
    },
    violation: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    grace_minutes: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'penalty_rules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = PenaltyRule;
//# sourceMappingURL=penaltyRule.model.js.map