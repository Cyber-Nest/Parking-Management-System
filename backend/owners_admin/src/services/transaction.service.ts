import { transactionRepository } from '../repositories/transaction.repository';

export interface CreateTransactionDTO {
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'apple_pay' | 'google_pay' | 'stripe';
  transactionType: 'parking_booking' | 'penalty_payment' | 'booking_extension' | 'refund' | 'adjustment';
  bookingId?: string;
  penaltyId?: string;
  userEmail: string;
  stripePaymentIntentId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TransactionResponse {
  id: string;
  transaction_reference: string;
  amount: number;
  status: string;
  created_at: Date;
}

export class TransactionService {
  async createTransaction(dto: CreateTransactionDTO): Promise<TransactionResponse> {
    const transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const result = await transactionRepository.createTransaction({
      transaction_reference: transactionReference,
      amount: dto.amount,
      currency: 'CAD',
      payment_method: dto.paymentMethod,
      payment_gateway: 'stripe',
      stripe_payment_intent_id: dto.stripePaymentIntentId,
      transaction_type: dto.transactionType,
      booking_id: dto.bookingId,
      penalty_id: dto.penaltyId,
      user_email: dto.userEmail,
      ip_address: dto.ipAddress,
      user_agent: dto.userAgent,
      metadata: {
        created_at: new Date().toISOString()
      }
    });

    return {
      id: result?.id,
      transaction_reference: result?.transaction_reference,
      amount: result?.amount,
      status: result?.status,
      created_at: new Date(),
    };
  }

  async getTransaction(id: string) {
    return await transactionRepository.findTransactionById(id);
  }

  async getTransactionByReference(reference: string) {
    return await transactionRepository.findByReference(reference);
  }

  async getTransactionsByEmail(email: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return await transactionRepository.findByEmail(email, limit, offset);
  }

  async getTransactionByStripeId(stripePaymentIntentId: string) {
    return await transactionRepository.findByStripeIntentId(stripePaymentIntentId);
  }

  async completeTransaction(id: string): Promise<void> {
    await transactionRepository.markAsCompleted(id);
  }

  async failTransaction(id: string, responseCode: string, responseMessage: string): Promise<void> {
    await transactionRepository.markAsFailed(id, responseCode, responseMessage);
  }

  async getTransactionStats(startDate?: Date, endDate?: Date) {
    return await transactionRepository.getTransactionStats(startDate, endDate);
  }

  async getRevenueByDate(startDate: Date, endDate: Date) {
    return await transactionRepository.getRevenueByDate(startDate, endDate);
  }

  async getTodayRevenue() {
    return await transactionRepository.getTodayRevenue();
  }
}

export const transactionService = new TransactionService();
