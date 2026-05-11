import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Ticket = sequelize.define("Ticket", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  ticket_number: DataTypes.STRING,
  license_plate: DataTypes.STRING,
  reason: DataTypes.STRING,
  amount: DataTypes.FLOAT,
  status: DataTypes.ENUM("unpaid", "paid", "cancelled", "disputed", "resolved")
}, {
  tableName: 'penalty_tickets',
  timestamps: false,
});