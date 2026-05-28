"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.resetPassword = exports.forgotPassword = exports.login = void 0;
const officerAuth_service_1 = require("../services/officerAuth.service");
const authService = officerAuth_service_1.officerAuthService;
const handleError = (err, res) => {
    console.error('[OfficerAuthController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
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
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }
        await authService.forgotPassword({ email });
        res.status(200).json({ success: true, message: 'If this email is registered, you will receive a reset link shortly.' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, officerId, newPassword } = req.body;
        if (!token || !officerId || !newPassword) {
            res.status(400).json({ success: false, message: 'token, officerId and newPassword are required' });
            return;
        }
        await authService.resetPassword({ token, officerId, newPassword });
        res.status(200).json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.resetPassword = resetPassword;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, message: 'refreshToken is required' });
            return;
        }
        const accessToken = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({ success: true, message: 'Token refreshed', data: { accessToken } });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=officerAuth.controller.js.map