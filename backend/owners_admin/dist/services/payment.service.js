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
    async getById(id) {
        const row = await paymentRepo.findById(id);
        if (!row)
            throw new commonErrors_1.NotFoundError('Payment not found');
        return row;
    }
    getReceiptPayload(row) {
        const subtotal = Number(row.amount);
        return {
            receipt_id: row.id,
            receipt_number: row.receipt_number,
            license_plate: row.license_plate,
            amount: subtotal,
            payment_method: row.payment_method,
            payment_type: row.payment_type,
            status: row.status,
            transaction_ref: row.transaction_ref,
            paid_at: row.paid_at,
            receipt_date: row.receipt_date,
            created_at: row.created_at,
            session_id: row.session_id,
            ticket_id: row.ticket_id,
            line_items: [
                { description: `${row.payment_type} payment`, amount: subtotal },
            ],
            total: subtotal,
        };
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map