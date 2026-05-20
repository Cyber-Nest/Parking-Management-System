import dotenv from 'dotenv';
import { execute } from '../src/config/database';

dotenv.config();

const generateId = () => require('crypto').randomUUID();

const sampleCustomers = [
  { email: 'john.doe@example.com', name: 'John Doe', phone: '416-555-0101' },
  { email: 'jane.smith@example.com', name: 'Jane Smith', phone: '416-555-0102' },
  { email: 'mike.johnson@example.com', name: 'Mike Johnson', phone: '416-555-0103' },
  { email: 'sarah.williams@example.com', name: 'Sarah Williams', phone: '416-555-0104' },
  { email: 'robert.brown@example.com', name: 'Robert Brown', phone: '416-555-0105' },
  { email: 'emily.davis@example.com', name: 'Emily Davis', phone: '416-555-0106' },
  { email: 'david.miller@example.com', name: 'David Miller', phone: '416-555-0107' },
  { email: 'jessica.wilson@example.com', name: 'Jessica Wilson', phone: '416-555-0108' },
];

const sampleVehicles = [
  { model: 'Tesla Model 3', color: 'Silver', plates: ['ONT-001', 'ONT-002', 'ONT-003'] },
  { model: 'Honda Civic', color: 'Black', plates: ['ONT-004', 'ONT-005', 'ONT-006'] },
  { model: 'BMW X5', color: 'White', plates: ['ONT-007', 'ONT-008', 'ONT-009'] },
  { model: 'Toyota Camry', color: 'Gray', plates: ['ONT-010', 'ONT-011', 'ONT-012'] },
  { model: 'Ford Mustang', color: 'Red', plates: ['ONT-013', 'ONT-014', 'ONT-015'] },
  { model: 'Audi A4', color: 'Blue', plates: ['ONT-016', 'ONT-017', 'ONT-018'] },
  { model: 'Mercedes C-Class', color: 'Black', plates: ['ONT-019', 'ONT-020', 'ONT-021'] },
  { model: 'Mazda 3', color: 'White', plates: ['ONT-022', 'ONT-023', 'ONT-024'] },
];

const parkingZones = [
  { id: 'zone-1', name: 'Central Parking Tower', location: '123 Commerce St, Downtown Toronto' },
  { id: 'zone-2', name: 'Maple Street Parking Hub', location: '456 Maple Ave, Toronto' },
  { id: 'zone-3', name: 'Riverside Parking Complex', location: '789 River Rd, Toronto' },
  { id: 'zone-4', name: 'Uptown Parking Garage', location: '321 Uptown Ave, Toronto' },
];

export async function seedTransactionsAndInvoices() {
  try {
    console.log('Starting seed data generation...');

    // Create 25 bookings
    console.log('Creating bookings...');
    const bookingIds: string[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);

    for (let i = 0; i < 25; i++) {
      const customer = sampleCustomers[i % sampleCustomers.length];
      const vehicleType = sampleVehicles[i % sampleVehicles.length];
      const plateIndex = Math.floor(i / sampleCustomers.length);
      const plate = vehicleType.plates[plateIndex % vehicleType.plates.length];
      const zone = parkingZones[i % parkingZones.length];

      const startTime = new Date(baseDate);
      startTime.setDate(startTime.getDate() + i);
      startTime.setHours(Math.floor(Math.random() * 20) + 6);
      startTime.setMinutes(0);

      const duration = [30, 60, 180, 300, 720][Math.floor(Math.random() * 5)];
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      const hourlyRate = [3, 3.5, 4, 4.5][Math.floor(Math.random() * 4)];
      const basePrice = (duration / 60) * hourlyRate;
      const taxAmount = basePrice * 0.13;
      const serviceFee = 2;
      const totalPrice = basePrice + taxAmount + serviceFee;

      const bookingId = generateId();
      bookingIds.push(bookingId);

      const bookingQuery = `
        INSERT INTO bookings (
          id, booking_reference, parking_zone_id, parking_name, parking_location,
          customer_email, vehicle_model, vehicle_plate_number, vehicle_color,
          start_time, end_time, duration_minutes, hourly_rate,
          base_price, tax_amount, service_fee, total_price, currency,
          spot_id, zone_name, booking_status, payment_status, grace_period_minutes,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 15, NOW(), NOW()
        );
      `;

      const durationLabels: any = {
        30: '30M',
        60: '1H',
        180: '3H',
        300: '5H',
        720: 'FULL DAY'
      };

      const values = [
        bookingId,
        `PS-${1000000 + i}`,
        zone.id,
        zone.name,
        zone.location,
        customer.email,
        vehicleType.model,
        plate,
        vehicleType.color,
        startTime,
        endTime,
        duration,
        hourlyRate,
        basePrice.toFixed(2),
        taxAmount.toFixed(2),
        serviceFee,
        totalPrice.toFixed(2),
        'CAD',
        `SPOT-${String(i + 1).padStart(4, '0')}`,
        zone.name,
        'confirmed',
        'paid'
      ];

      await execute(bookingQuery, values);
      console.log(`✓ Created booking ${i + 1}/25`);
    }

    const transactionIds: string[] = [];

    // Create transactions
    console.log('Creating transactions...');
    for (let i = 0; i < 25; i++) {
      const bookingId = bookingIds[i];
      const customer = sampleCustomers[i % sampleCustomers.length];
      const transactionId = generateId();

      const amount = (Math.random() * 50 + 10).toFixed(2);
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - (25 - i));

      const transactionQuery = `
        INSERT INTO transactions (
          id, transaction_reference, amount, currency, payment_method,
          payment_gateway, stripe_payment_intent_id, transaction_type,
          status, booking_id, user_email, initiated_at, completed_at,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, 'CAD', ?, ?, ?, 'parking_booking',
          'completed', ?, ?, ?, ?, NOW(), NOW()
        );
      `;

      const paymentMethods = ['credit_card', 'debit_card', 'stripe'];
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const stripeId = `pi_${generateId().slice(0, 8)}`;

      const values = [
        transactionId,
        `TXN-${Date.now()}-${i}`,
        amount,
        method,
        'stripe',
        stripeId,
        bookingId,
        customer.email,
        createdDate,
        createdDate,
      ];

      await execute(transactionQuery, values);
      transactionIds.push(transactionId);
      console.log(`✓ Created transaction ${i + 1}/25`);
    }

    // Create invoices
    console.log('Creating invoices...');
    for (let i = 0; i < 25; i++) {
      const customer = sampleCustomers[i % sampleCustomers.length];
      const vehicleType = sampleVehicles[i % sampleVehicles.length];
      const zone = parkingZones[i % parkingZones.length];
      const invoiceId = generateId();

      const amount = Math.random() * 50 + 10;
      const subtotal = amount;
      const tax = subtotal * 0.13;
      const total = subtotal + tax + 2;

      const invoiceDate = new Date();
      invoiceDate.setDate(invoiceDate.getDate() - (25 - i));

      const invoiceQuery = `
        INSERT INTO invoices (
          id, invoice_number, invoice_date, customer_email, customer_name,
          vehicle_plate_number, vehicle_model, vehicle_color, item_description,
          item_type, quantity, unit_price, subtotal, tax_amount, tax_rate,
          service_fee, total_amount, currency, payment_status, status,
          booking_id, transaction_id, parking_zone, parking_location, download_count,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 'parking_booking', 1,
          ?, ?, ?, 13, 2, ?, 'CAD', 'paid', 'paid', ?, ?, ?, ?, 0,
          NOW(), NOW()
        );
      `;

      const plateIndex = Math.floor(i / sampleCustomers.length);
      const plate = vehicleType.plates[plateIndex % vehicleType.plates.length];

      const values = [
        invoiceId,
        `INV-${Date.now()}-${i}`,
        invoiceDate,
        customer.email,
        customer.name,
        plate,
        vehicleType.model,
        vehicleType.color,
        `Parking at ${zone.name}`,
        subtotal.toFixed(2),
        subtotal.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2),
        bookingIds[i],
        transactionIds[i],
        zone.name,
        zone.location,
      ];

      await execute(invoiceQuery, values);
      console.log(`✓ Created invoice ${i + 1}/25`);
    }

    console.log('✅ Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedTransactionsAndInvoices()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
