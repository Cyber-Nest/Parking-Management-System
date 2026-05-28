"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTicketNote = exports.cancelTicket = exports.markTicketPaid = exports.updateTicket = exports.getTicketPrint = exports.getTicketById = exports.createTicket = exports.getTicketSummary = exports.listTickets = void 0;
const ticket_service_1 = require("../services/ticket.service");
const commonErrors_1 = require("../services/commonErrors");
const ticketService = new ticket_service_1.TicketService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
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
const getTicketById = async (req, res) => {
    try {
        const data = await ticketService.getById(req.params.id);
        res.status(200).json({ success: true, message: 'Ticket fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getTicketById = getTicketById;
const getTicketPrint = async (req, res) => {
    try {
        const ticket = await ticketService.getById(req.params.id);
        const data = ticketService.getPrintPayload(ticket);
        res.status(200).json({ success: true, message: 'Ticket print data', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getTicketPrint = getTicketPrint;
const updateTicket = async (req, res) => {
    try {
        const data = await ticketService.updateTicket(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Ticket updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateTicket = updateTicket;
const markTicketPaid = async (req, res) => {
    try {
        const data = await ticketService.markPaid(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Ticket marked paid', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.markTicketPaid = markTicketPaid;
const cancelTicket = async (req, res) => {
    try {
        await ticketService.cancelTicket(req.params.id);
        res.status(200).json({ success: true, message: 'Ticket cancelled' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.cancelTicket = cancelTicket;
const addTicketNote = async (req, res) => {
    try {
        const { note } = req.body;
        if (!note?.trim()) {
            res.status(400).json({ success: false, message: 'note is required' });
            return;
        }
        await ticketService.addNote(req.params.id, note);
        res.status(200).json({ success: true, message: 'Note saved' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.addTicketNote = addTicketNote;
//# sourceMappingURL=ticket.controller.js.map