"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkingPlan = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.ParkingPlan = database_1.sequelize.define("ParkingPlan", {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    name: sequelize_1.DataTypes.STRING,
    price: sequelize_1.DataTypes.FLOAT,
    duration: sequelize_1.DataTypes.INTEGER,
    plan_type: sequelize_1.DataTypes.STRING,
    tax_percent: sequelize_1.DataTypes.FLOAT,
    status: sequelize_1.DataTypes.STRING
}, {
    tableName: 'parking_plans',
    timestamps: false,
});
//# sourceMappingURL=parkingplan.model.js.map