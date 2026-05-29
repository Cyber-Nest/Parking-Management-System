"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const ticket_controller_1 = require("../controllers/ticket.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/summary', ...adminOnly(ticket_controller_1.getTicketSummary));
router.get('/:id/print', ...adminOnly(ticket_controller_1.getTicketPrint));
router.get('/:id', ...adminOnly(ticket_controller_1.getTicketById));
router.patch('/:id/mark-paid', ...adminOnly(ticket_controller_1.markTicketPaid));
router.patch('/:id/cancel', ...adminOnly(ticket_controller_1.cancelTicket));
router.patch('/:id/note', ...adminOnly(ticket_controller_1.addTicketNote));
router.patch('/:id', ...adminOnly(ticket_controller_1.updateTicket));
router.get('/', ...adminOnly(ticket_controller_1.listTickets));
router.post('/', ...adminOnly(ticket_controller_1.createTicket));
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map