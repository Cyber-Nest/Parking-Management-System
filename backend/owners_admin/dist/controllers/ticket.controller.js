"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = exports.getTicketSummary = exports.listTickets = void 0;
const ticket_service_1 = require("../services/ticket.service");
const commonErrors_1 = require("../services/commonErrors");
const ticketService = new ticket_service_1.TicketService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[TicketController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listTickets = async (req, res) => {
    try {
        const data = await ticketService.list(req.query);
        res.status(200).json({ success: true, message: 'Tickets fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listTickets = listTickets;
const getTicketSummary = async (_req, res) => {
    try {
        const data = await ticketService.summary();
        res.status(200).json({ success: true, message: 'Ticket summary fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getTicketSummary = getTicketSummary;
const createTicket = async (req, res) => {
    try {
        const data = await ticketService.create(req.body);
        res.status(201).json({ success: true, message: 'Ticket created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createTicket = createTicket;
//# sourceMappingURL=ticket.controller.js.map