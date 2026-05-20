import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Officer = sequelize.define('Officer', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  full_name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  phone: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
}, {
  tableName: 'officers',
  timestamps: false,
});