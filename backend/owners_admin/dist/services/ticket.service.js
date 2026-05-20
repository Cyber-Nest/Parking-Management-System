"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const ticket_repository_1 = require("../repositories/ticket.repository");
const payment_repository_1 = require("../repositories/payment.repository");
const commonErrors_1 = require("./commonErrors");
const ticketRepo = new ticket_repository_1.TicketRepository();
const paymentRepo = new payment_repository_1.PaymentRepository();
class TicketService {
    async list(query) {
        const page = Math.max(1, Number(query.page ?? '1'));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? '20')));
        const { items, total } = await ticketRepo.list({
            page,
            limit,
            q: query.q?.trim() || undefined,
            status: query.status || undefined,
            officerId: query.officer_id,
            from: query.from,
            to: query.to,
        });
        const mapped = items.map((t) => ({
            id: t.id,
            ticket_number: t.ticket_number,
            officer_id: t.officer_id,
            officer_name: t.officer_name,
            license_plate: t.license_plate,
            amount: t.amount,
            reason: t.reason,
            status: t.status,
            date_issued: t.date_issued,
            due_date: t.due_date,
            paid_at: t.paid_at,
            remarks: t.remarks,
            note: t.note,
            dispute_raised: t.dispute_raised === 1,
            photos: [],
            location_name: t.location_name ?? null,
        }));
        return {
            items: mapped,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async summary() {
        return ticketRepo.summary();
    }
    async create(body) {
        if (!body.officer_id)
            throw new commonErrors_1.ValidationError('officer_id is required');
        if (!body.officer_name?.trim())
            throw new commonErrors_1.ValidationError('officer_name is required');
        if (!body.license_plate?.trim())
            throw new commonErrors_1.ValidationError('license_plate is required');
        if (typeof body.amount !== 'number' || body.amount <= 0) {
            throw new commonErrors_1.ValidationError('amount must be a positive number');
        }
        if (!body.reason?.trim())
            throw new commonErrors_1.ValidationError('reason is required');
        const id = await ticketRepo.create({
            officerId: body.officer_id,
            officerName: body.officer_name,
            licensePlate: body.license_plate,
            amount: body.amount,
            reason: body.reason,
            status: body.status,
            dueDate: body.due_date,
            sessionId: body.session_id,
            remarks: body.remarks,
        });
        return { id };
    }
    async getById(id) {
        const t = await ticketRepo.findById(id);
        if (!t)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        return {
            id: t.id,
            ticket_number: t.ticket_number,
            officer_id: t.officer_id,
            officer_name: t.officer_name,
            license_plate: t.license_plate,
            amount: t.amount,
            reason: t.reason,
            status: t.status,
            date_issued: t.date_issued,
            due_date: t.due_date,
            paid_at: t.paid_at,
            remarks: t.remarks,
            note: t.note,
            dispute_raised: t.dispute_raised === 1,
            photos: [],
            location_name: t.location_name ?? null,
        };
    }
    async updateTicket(id, body) {
        const existing = await ticketRepo.findById(id);
        if (!existing)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        if (existing.status === 'paid' || existing.status === 'cancelled') {
            throw new commonErrors_1.ValidationError('Cannot edit a paid or cancelled ticket');
        }
        await ticketRepo.updateTicket(id, {
            licensePlate: body.license_plate,
            amount: body.amount,
            reason: body.reason,
            dueDate: body.due_date,
            locationName: body.location_name,
        });
        return this.getById(id);
    }
    async addNote(id, note) {
        if (!note?.trim())
            throw new commonErrors_1.ValidationError('note is required');
        const n = await ticketRepo.appendRemarks(id, note.trim());
        if (n === 0)
            throw new commonErrors_1.NotFoundError('Ticket not found');
    }
    async cancelTicket(id) {
        const t = await ticketRepo.findById(id);
        if (!t)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        if (t.status === 'paid')
            throw new commonErrors_1.ValidationError('Cannot cancel a paid ticket');
        await ticketRepo.setStatus(id, 'cancelled');
    }
    async markPaid(id, body) {
        const t = await ticketRepo.findById(id);
        if (!t)
            throw new commonErrors_1.NotFoundError('Ticket not found');
        if (t.status !== 'unpaid' && t.status !== 'disputed') {
            throw new commonErrors_1.ValidationError('Only unpaid or disputed tickets can be marked paid');
        }
        const method = body?.payment_method || 'visa';
        const paymentId = await paymentRepo.create({
            ticketId: id,
            licensePlate: t.license_plate,
            amount: Number(t.amount),
            paymentMethod: method,
            paymentType: 'penalty',
            status: 'success',
            transactionRef: body?.transaction_ref ?? `ADMIN-${Date.now()}`,
            paidAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        });
        await ticketRepo.setStatus(id, 'paid', { paymentId });
        return { payment_id: paymentId };
    }
}
exports.TicketService = TicketService;
//# sourceMappingURL=ticket.service.js.map