import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },

  // Booking Details
  booking_reference: { type: DataTypes.STRING, unique: true, allowNull: false },
  parking_lot_id: { type: DataTypes.UUID, allowNull: true },
  parking_zone_id: { type: DataTypes.UUID, allowNull: false },
  parking_name: { type: DataTypes.STRING, allowNull: false },
  parking_location: { type: DataTypes.STRING },

  // Customer Details
  customer_email: { type: DataTypes.STRING, allowNull: false },
  vehicle_model: { type: DataTypes.STRING, allowNull: false },
  vehicle_plate_number: { type: DataTypes.STRING, allowNull: false },
  vehicle_color: { type: DataTypes.STRING },

  // Time Details
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: false },
  duration_label: { type: DataTypes.STRING },

  // Pricing
  hourly_rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  service_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "CAD" },

  // Parking Details
  spot_id: { type: DataTypes.STRING },
  zone_name: { type: DataTypes.STRING },

  // Status
  booking_status: {
    type: DataTypes.ENUM("pending", "confirmed", "active", "completed", "extended", "cancelled"),
    defaultValue: "pending"
  },

  // Payment
  payment_status: {
    type: DataTypes.ENUM("unpaid", "pending", "paid", "failed", "refunded"),
    defaultValue: "unpaid"
  },
  payment_id: { type: DataTypes.UUID },
  stripe_payment_intent_id: { type: DataTypes.STRING },

  // Extra Features
  allow_extension: { type: DataTypes.BOOLEAN, defaultValue: true },
  total_extensions: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Violation
  grace_period_minutes: { type: DataTypes.INTEGER, defaultValue: 15 },
  has_violation: { type: DataTypes.BOOLEAN, defaultValue: false },
  violation_reason: { type: DataTypes.STRING },
  penalty_issued_at: { type: DataTypes.DATE },

  // Notes
  notes: { type: DataTypes.TEXT },

  // Metadata
  metadata: { type: DataTypes.JSON },
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
});
