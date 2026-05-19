import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Invoice = sequelize.define("Invoice", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  
  // Invoice Details
  invoice_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  invoice_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE },
  
  // Customer Info
  customer_email: { type: DataTypes.STRING, allowNull: false },
  customer_name: { type: DataTypes.STRING },
  vehicle_plate_number: { type: DataTypes.STRING },
  vehicle_model: { type: DataTypes.STRING },
  vehicle_color: { type: DataTypes.STRING },
  
  // Invoice Items
  item_description: { type: DataTypes.TEXT, allowNull: false },
  item_type: { 
    type: DataTypes.ENUM("parking_booking", "penalty", "extension", "adjustment"),
    allowNull: false 
  },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  
  // Charges & Discounts
  tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount_reason: { type: DataTypes.STRING },
  service_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  
  // Total
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "CAD" },
  
  // Payment & Status
  payment_status: { 
    type: DataTypes.ENUM("unpaid", "partial", "paid", "overdue", "cancelled"),
    defaultValue: "unpaid"
  },
  paid_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paid_date: { type: DataTypes.DATE },
  
  // Related IDs
  booking_id: { type: DataTypes.UUID },
  penalty_id: { type: DataTypes.UUID },
  transaction_id: { type: DataTypes.UUID },
  
  // Status & Notes
  status: { 
    type: DataTypes.ENUM("draft", "issued", "sent", "viewed", "paid", "cancelled"),
    defaultValue: "draft"
  },
  notes: { type: DataTypes.TEXT },
  payment_terms: { type: DataTypes.STRING, defaultValue: "Due upon receipt" },
  
  // Parking Details (if applicable)
  parking_zone: { type: DataTypes.STRING },
  parking_location: { type: DataTypes.STRING },
  start_time: { type: DataTypes.DATE },
  end_time: { type: DataTypes.DATE },
  duration_minutes: { type: DataTypes.INTEGER },
  
  // File Info
  pdf_file_path: { type: DataTypes.STRING },
  file_generated_at: { type: DataTypes.DATE },
  download_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_downloaded_at: { type: DataTypes.DATE },
  
  // Metadata
  metadata: { type: DataTypes.JSON },
}, {
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
});
