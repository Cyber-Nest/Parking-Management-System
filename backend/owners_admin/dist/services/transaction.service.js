"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const transaction_repository_1 = require("../repositories/transaction.repository");
class TransactionService {
    async createTransaction(dto) {
        const transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const result = await transaction_repository_1.transactionRepository.createTransaction({
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
            created_at: result?.created_at,
        };
    }
    async getTransaction(id) {
        return await transaction_repository_1.transactionRepository.findTransactionById(id);
    }
    async getTransactionByReference(reference) {
        return await transaction_repository_1.transactionRepository.findByReference(reference);
    }
    async getTransactionsByEmail(email, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        return await transaction_repository_1.transactionRepository.findByEmail(email, limit, offset);
    }
    async getTransactionByStripeId(stripePaymentIntentId) {
        return await transaction_repository_1.transactionRepository.findByStripeIntentId(stripePaymentIntentId);
    }
    async completeTransaction(id) {
        await transaction_repository_1.transactionRepository.markAsCompleted(id);
    }
    async failTransaction(id, responseCode, responseMessage) {
        await transaction_repository_1.transactionRepository.markAsFailed(id, responseCode, responseMessage);
    }
    async getTransactionStats(startDate, endDate) {
        return await transaction_repository_1.transactionRepository.getTransactionStats(startDate, endDate);
    }
    async getRevenueByDate(startDate, endDate) {
        return await transaction_repository_1.transactionRepository.getRevenueByDate(startDate, endDate);
    }
    async getTodayRevenue() {
        return await transaction_repository_1.transactionRepository.getTodayRevenue();
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transaction.service.js.map