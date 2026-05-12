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
router.get('/', ...adminOnly(ticket_controller_1.listTickets));
router.get('/summary', ...adminOnly(ticket_controller_1.getTicketSummary));
router.post('/', ...adminOnly(ticket_controller_1.createTicket));
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map