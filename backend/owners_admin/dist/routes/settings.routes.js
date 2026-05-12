"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const settings_controller_1 = require("../controllers/settings.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
router.get('/system', ...adminOnly(settings_controller_1.getSystemSettings));
router.put('/system', ...adminOnly(settings_controller_1.updateSystemSettings));
router.get('/branding', ...adminOnly(settings_controller_1.getBrandingSettings));
router.put('/branding', ...adminOnly(settings_controller_1.updateBrandingSettings));
exports.default = router;
//# sourceMappingURL=settings.routes.js.map