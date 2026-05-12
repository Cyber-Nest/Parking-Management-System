"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/', ...adminOnly(payment_controller_1.listPayments));
router.get('/summary', ...adminOnly(payment_controller_1.getPaymentSummary));
router.post('/', ...adminOnly(payment_controller_1.createPayment));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map