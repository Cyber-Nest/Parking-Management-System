import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  
  // Transaction Details
  transaction_reference: { type: DataTypes.STRING, unique: true, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "CAD" },
  
  // Payment Method
  payment_method: { 
    type: DataTypes.ENUM("credit_card", "debit_card", "apple_pay", "google_pay", "stripe"),
    allowNull: false 
  },
  payment_gateway: { type: DataTypes.STRING, defaultValue: "stripe" },
  stripe_payment_intent_id: { type: DataTypes.STRING },
  
  // Transaction Type
  transaction_type: { 
    type: DataTypes.ENUM("parking_booking", "penalty_payment", "booking_extension", "refund", "adjustment"),
    allowNull: false 
  },
  
  // Status
  status: { 
    type: DataTypes.ENUM("initiated", "processing", "completed", "failed", "refunded", "cancelled"),
    defaultValue: "initiated"
  },
  
  // Related IDs
  booking_id: { type: DataTypes.UUID },
  penalty_id: { type: DataTypes.UUID },
  user_email: { type: DataTypes.STRING, allowNull: false },
  
  // Response Details
  response_code: { type: DataTypes.STRING },
  response_message: { type: DataTypes.TEXT },
  
  // Timestamps
  initiated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE },
  failed_at: { type: DataTypes.DATE },
  
  // Metadata
  metadata: { type: DataTypes.JSON },
  ip_address: { type: DataTypes.STRING },
  user_agent: { type: DataTypes.TEXT },
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
});
