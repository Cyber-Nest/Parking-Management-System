import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  amount: DataTypes.FLOAT,
  payment_method: DataTypes.ENUM("credit_card", "debit_card", "apple_pay", "visa", "mastercard", "amex"),
  payment_type: DataTypes.ENUM("parking", "penalty", "extension"),
  status: DataTypes.ENUM("pending", "success", "failed", "refunded"),
  receipt_number: DataTypes.STRING,
  receipt_date: DataTypes.DATE,
}, {
  tableName: 'payments',
  timestamps: false,
});