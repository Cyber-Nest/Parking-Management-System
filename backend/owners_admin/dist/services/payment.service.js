"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const payment_repository_1 = require("../repositories/payment.repository");
const commonErrors_1 = require("./commonErrors");
const paymentRepo = new payment_repository_1.PaymentRepository();
class PaymentService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { items, total } = await paymentRepo.list({
            page,
            limit,
            q: query.q?.trim() || undefined,
            status: query.status || undefined,
            paymentMethod: query.payment_method,
            paymentType: query.payment_type,
            from: query.from,
            to: query.to,
        });
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async summary() {
        return paymentRepo.summary();
    }
    async create(body) {
        if (!body.license_plate?.trim())
            throw new commonErrors_1.ValidationError('license_plate is required');
        if (typeof body.amount !== 'number' || body.amount <= 0) {
            throw new commonErrors_1.ValidationError('amount must be a positive number');
        }
        if (!body.payment_method)
            throw new commonErrors_1.ValidationError('payment_method is required');
        if (!body.payment_type)
            throw new commonErrors_1.ValidationError('payment_type is required');
        const id = await paymentRepo.create({
            sessionId: body.session_id,
            ticketId: body.ticket_id,
            userId: body.user_id,
            licensePlate: body.license_plate,
            amount: body.amount,
            paymentMethod: body.payment_method,
            paymentType: body.payment_type,
            status: body.status,
            transactionRef: body.transaction_ref,
            paidAt: body.paid_at,
        });
        return { id };
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map