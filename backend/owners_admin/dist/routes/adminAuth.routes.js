"use strict";
// src/routes/adminAuth.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_controller_1 = require("../controllers/adminAuth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const protect = (handler) => {
    if (typeof auth_middleware_1.verifyToken !== 'function')
        throw new Error('verifyToken is not a function — check auth.middleware export');
    if (typeof auth_middleware_1.requireAdmin !== 'function')
        throw new Error('requireAdmin is not a function — check auth.middleware export');
    if (typeof handler !== 'function')
        throw new Error('protect() received a non-function handler');
    return [
        auth_middleware_1.verifyToken,
        auth_middleware_1.requireAdmin,
        handler,
    ];
};
// ─── Public ───────────────────────────────────────────────────
router.post('/login', adminAuth_controller_1.login);
router.post('/refresh', adminAuth_controller_1.refreshToken);
router.post('/forgot-password', adminAuth_controller_1.forgotPassword);
router.post('/reset-password', adminAuth_controller_1.resetPassword);
// ─── Protected (requires valid JWT + admin role) ──────────────
router.post('/logout', ...protect(adminAuth_controller_1.logout));
router.get('/me', ...protect(adminAuth_controller_1.getMe));
exports.default = router;
//# sourceMappingURL=adminAuth.routes.js.map