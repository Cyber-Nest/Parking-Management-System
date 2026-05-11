import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const ParkingPlan = sequelize.define("ParkingPlan", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: DataTypes.STRING,
  price: DataTypes.FLOAT,
  duration: DataTypes.INTEGER
}, {
  tableName: 'parking_plans',
  timestamps: false,
});