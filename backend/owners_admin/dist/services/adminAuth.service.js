"use strict";
// src/services/adminAuth.service.ts
// Business logic for admin authentication — sits between controller and repository
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const admin_repository_1 = require("../repositories/admin.repository");
const admin_model_1 = require("../models/admin.model");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const env_1 = require("../config/env");
const commonErrors_1 = require("./commonErrors");
const adminRepo = new admin_repository_1.AdminRepository();
const authTokenRepo = new admin_repository_1.AuthTokenRepository();
class AdminAuthService {
    // ─── LOGIN ─────────────────────────────────────────────────
    async login(body) {
        const { email, password } = body;
        // 1. Find admin
        const row = await adminRepo.findByEmail(email);
        if (!row) {
            throw new commonErrors_1.UnauthorizedError('Invalid email or password');
        }
        // 2. Check active
        if (!row.is_active) {
            throw new commonErrors_1.ForbiddenError('Account is deactivated. Contact support.');
        }
        // 3. Verify password
        const isMatch = await bcryptjs_1.default.compare(password, row.password_hash);
        if (!isMatch) {
            throw new commonErrors_1.UnauthorizedError('Invalid email or password');
        }
        // 4. Build token payload
        const payload = {
            id: row.id,
            email: row.email,
            userType: 'admin',
            role: row.role_name,
        };
        // 5. Sign tokens
        const accessToken = (0, jwt_1.signAccessToken)(payload);
        const refreshToken = (0, jwt_1.signRefreshToken)(payload);
        // 6. Persist refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
        await authTokenRepo.create({
            userId: row.id,
            userType: 'admin',
            refreshToken,
            expiresAt,
        });
        // 7. Update last login
        await adminRepo.updateLastLogin(row.id);
        return {
            accessToken,
            refreshToken,
            admin: (0, admin_model_1.toAdminPublic)(row),
        };
    }
    // ─── LOGOUT ────────────────────────────────────────────────
    async logout(refreshToken, adminId) {
        // Revoke refresh token — don't throw if already revoked (idempotent)
        await authTokenRepo.revoke(refreshToken, adminId);
    }
    // ─── REFRESH ACCESS TOKEN ──────────────────────────────────
    async refreshAccessToken(refreshToken) {
        // 1. Verify JWT signature
        let decoded;
        try {
            decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new commonErrors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        // 2. Check token still valid in DB (not revoked)
        const stored = await authTokenRepo.findValid(refreshToken);
        if (!stored) {
            throw new commonErrors_1.UnauthorizedError('Refresh token has been revoked or expired');
        }
        // 3. Issue new access token
        return (0, jwt_1.signAccessToken)({
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType,
            role: decoded.role,
        });
    }
    // ─── FORGOT PASSWORD ───────────────────────────────────────
    async forgotPassword(body) {
        const { email } = body;
        const row = await adminRepo.findByEmail(email);
        // Always succeed silently — prevents email enumeration
        if (!row || !row.is_active)
            return;
        // Generate raw token (sent to user) and hash (stored in DB)
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await adminRepo.saveResetToken(row.id, tokenHash, expiresAt);
        const resetLink = `${env_1.env.frontendUrl}/admin/reset-password?token=${rawToken}&id=${row.id}`;
        await (0, email_1.sendEmail)({
            to: row.email,
            subject: 'ParkSmart — Reset Your Admin Password',
            html: (0, email_1.passwordResetTemplate)(row.full_name, resetLink),
            emailType: 'password_reset',
            relatedId: row.id,
        });
    }
    // ─── RESET PASSWORD ────────────────────────────────────────
    async resetPassword(body) {
        const { token, adminId, newPassword } = body;
        if (newPassword.length < 8) {
            throw new commonErrors_1.ValidationError('Password must be at least 8 characters');
        }
        // Hash the incoming raw token to compare with DB
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const row = await adminRepo.findByResetToken(tokenHash, adminId);
        if (!row) {
            throw new commonErrors_1.BadRequestError('Invalid or expired reset token');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, env_1.env.bcryptSaltRounds);
        await adminRepo.updatePassword(adminId, passwordHash);
        // Force re-login everywhere
        await authTokenRepo.revokeAllForUser(adminId, 'admin');
    }
    // ─── GET ME ────────────────────────────────────────────────
    async getMe(adminId) {
        const row = await adminRepo.findById(adminId);
        if (!row) {
            throw new commonErrors_1.NotFoundError('Admin not found');
        }
        return (0, admin_model_1.toAdminPublic)(row);
    }
}
exports.AdminAuthService = AdminAuthService;
//# sourceMappingURL=adminAuth.service.js.map