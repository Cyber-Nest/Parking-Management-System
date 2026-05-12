"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const ticket_repository_1 = require("../repositories/ticket.repository");
const commonErrors_1 = require("./commonErrors");
const ticketRepo = new ticket_repository_1.TicketRepository();
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
            dispute_raised: t.dispute_raised === 1,
            photos: [],
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
}
exports.TicketService = TicketService;
//# sourceMappingURL=ticket.service.js.map