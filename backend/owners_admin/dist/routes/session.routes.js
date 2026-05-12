"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const session_controller_1 = require("../controllers/session.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/', ...adminOnly(session_controller_1.listSessions));
router.get('/summary', ...adminOnly(session_controller_1.getSessionSummary));
exports.default = router;
//# sourceMappingURL=session.routes.js.map