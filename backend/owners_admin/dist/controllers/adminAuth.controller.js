"use strict";
// src/controllers/adminAuth.controller.ts
// HTTP layer only — validates input, calls service, sends response
// No business logic here
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = void 0;
const adminAuth_service_1 = require("../services/adminAuth.service");
const commonErrors_1 = require("../services/commonErrors");
const authService = new adminAuth_service_1.AdminAuthService();
// ─── Helper: map service errors to HTTP responses ─────────────
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.UnauthorizedError ||
        err instanceof commonErrors_1.ForbiddenError ||
        err instanceof commonErrors_1.BadRequestError ||
        err instanceof commonErrors_1.ValidationError ||
        err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[Controller] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
// ─── POST /api/admin/auth/login ───────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const data = await authService.login({ email, password });
        res.status(200).json({ success: true, message: 'Login successful', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.login = login;
// ─── POST /api/admin/auth/logout ─────────────────────────────
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, message: 'refreshToken is required' });
            return;
        }
        await authService.logout(refreshToken, req.user.id);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.logout = logout;
// ─── POST /api/admin/auth/refresh ────────────────────────────
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ success: false, message: 'refreshToken is required' });
            return;
        }
        const accessToken = await authService.refreshAccessToken(token);
        res.status(200).json({ success: true, message: 'Token refreshed', data: { accessToken } });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.refreshToken = refreshToken;
// ─── POST /api/admin/auth/forgot-password ────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }
        await authService.forgotPassword({ email });
        // Always return success — prevents email enumeration
        res.status(200).json({
            success: true,
            message: 'If this email is registered, you will receive a reset link shortly.',
        });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.forgotPassword = forgotPassword;
// ─── POST /api/admin/auth/reset-password ─────────────────────
const resetPassword = async (req, res) => {
    try {
        const { token, adminId, newPassword } = req.body;
        if (!token || !adminId || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'token, adminId and newPassword are required',
            });
            return;
        }
        await authService.resetPassword({ token, adminId, newPassword });
        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please log in with your new password.',
        });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.resetPassword = resetPassword;
// ─── GET /api/admin/auth/me ───────────────────────────────────
const getMe = async (req, res) => {
    try {
        const data = await authService.getMe(req.user.id);
        res.status(200).json({ success: true, message: 'OK', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=adminAuth.controller.js.map