import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const ParkingPlan = sequelize.define("ParkingPlan", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: DataTypes.STRING,
  price: DataTypes.FLOAT,
  duration: DataTypes.INTEGER,
  plan_type: DataTypes.STRING,
  tax_percent: DataTypes.FLOAT,
  status: DataTypes.STRING,
  parking_lot_id: DataTypes.STRING,
}, {
  tableName: 'parking_plans',
  timestamps: false,
});