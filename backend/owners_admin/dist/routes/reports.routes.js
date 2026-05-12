"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const reports_controller_1 = require("../controllers/reports.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/:type', ...adminOnly(reports_controller_1.getReport));
exports.default = router;
//# sourceMappingURL=reports.routes.js.map