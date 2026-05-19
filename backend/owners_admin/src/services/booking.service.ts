import { bookingRepository } from '../repositories/booking.repository';

export interface CreateBookingDTO {
  parkingZoneId: string;
  parkingName: string;
  parkingLocation?: string;
  customerEmail: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleColor?: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  durationLabel: string;
  hourlyRate: number;
  basePrice: number;
  taxAmount: number;
  serviceFee: number;
  totalPrice: number;
  spotId?: string;
  zoneName?: string;
  parkingPlanId?: string;
}

export class BookingService {
  async createBooking(dto: CreateBookingDTO) {
    const bookingReference = `PS-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const result = await bookingRepository.createBooking({
      booking_reference: bookingReference,
      parking_zone_id: dto.parkingZoneId,
      parking_name: dto.parkingName,
      parking_location: dto.parkingLocation,
      customer_email: dto.customerEmail,
      vehicle_model: dto.vehicleModel,
      vehicle_plate_number: dto.vehiclePlateNumber,
      vehicle_color: dto.vehicleColor,
      start_time: dto.startTime,
      end_time: dto.endTime,
      duration_minutes: dto.durationMinutes,
      duration_label: dto.durationLabel,
      parking_plan_id: dto.parkingPlanId ?? null,
      hourly_rate: dto.hourlyRate,
      base_price: dto.basePrice,
      tax_amount: dto.taxAmount,
      service_fee: dto.serviceFee,
      total_price: dto.totalPrice,
      currency: 'CAD',
      spot_id: dto.spotId,
      zone_name: dto.zoneName,
      grace_period_minutes: 15,
      metadata: {
        created_at: new Date().toISOString()
      }
    });

    return result;
  }

  async getBooking(id: string) {
    return await bookingRepository.findBookingById(id);
  }

  async getBookingByReference(reference: string) {
    return await bookingRepository.findByReference(reference);
  }

  async getBookingsByEmail(email: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return await bookingRepository.findByEmail(email, limit, offset);
  }

  async getBookingsByPlate(plate: string) {
    return await bookingRepository.findByPlateNumber(plate);
  }

  async getActiveBookings() {
    return await bookingRepository.findActiveBookings();
  }

  async confirmBooking(bookingId: string, paymentId: string) {
    return bookingRepository.confirmBooking(bookingId, paymentId);
  }

  async markAsActive(bookingId: string) {
    return bookingRepository.markAsActive(bookingId);
  }

  async markAsCompleted(bookingId: string) {
    return bookingRepository.markAsCompleted(bookingId);
  }

  async updateBooking(bookingId: string, data: any) {
    return bookingRepository.updateBooking(bookingId, data);
  }

  async getBookingStats() {
    return await bookingRepository.getBookingStats();
  }

  async getTodayBookings() {
    return await bookingRepository.getTodayBookings();
  }
}

export const bookingService = new BookingService();
