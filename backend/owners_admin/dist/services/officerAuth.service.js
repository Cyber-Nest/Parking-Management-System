"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.officerAuthService = exports.OfficerAuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const officer_repository_1 = require("../repositories/officer.repository");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const env_1 = require("../config/env");
const commonErrors_1 = require("./commonErrors");
const officerRepo = new officer_repository_1.OfficerRepository();
// We'll import AuthTokenRepository from admin.repository to reuse token storage
const admin_repository_1 = require("../repositories/admin.repository");
const authTokenRepo = new admin_repository_1.AuthTokenRepository();
class OfficerAuthService {
    async login(body) {
        const { email, password } = body;
        const row = await officerRepo.findByEmail(email);
        if (!row)
            throw new commonErrors_1.UnauthorizedError('Invalid email');
        if (row.status !== 'active') {
            throw new commonErrors_1.ForbiddenError('Account is deactivated. Contact support.');
        }
        const isMatch = await bcryptjs_1.default.compare(password, row.password_hash);
        if (!isMatch)
            throw new commonErrors_1.UnauthorizedError('Invalid password');
        const payload = {
            id: row.id,
            email: row.email,
            userType: 'officer',
            role: 'officer',
        };
        const accessToken = (0, jwt_1.signAccessToken)(payload);
        const refreshToken = (0, jwt_1.signRefreshToken)(payload);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await authTokenRepo.create({ userId: row.id, userType: 'officer', refreshToken, expiresAt });
        await officerRepo.updateLastLogin(row.id);
        const officerRow = row;
        return {
            accessToken,
            refreshToken,
            officer: {
                id: officerRow.id,
                full_name: officerRow.full_name,
                fullName: officerRow.full_name,
                email: officerRow.email,
                phone: officerRow.phone ?? null,
                badge_number: officerRow.badge_number ?? null,
                badgeNumber: officerRow.badge_number ?? null,
                role: officerRow.role ?? 'OFFICER',
            },
        };
    }
    async logout(refreshToken, officerId) {
        await authTokenRepo.revoke(refreshToken, officerId);
    }
    async refreshAccessToken(refreshToken) {
        let decoded;
        try {
            decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new commonErrors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        const stored = await authTokenRepo.findValid(refreshToken);
        if (!stored)
            throw new commonErrors_1.UnauthorizedError('Refresh token has been revoked or expired');
        return (0, jwt_1.signAccessToken)({ id: decoded.id, email: decoded.email, userType: decoded.userType, role: decoded.role });
    }
    async forgotPassword(body) {
        const { email } = body;
        const row = await officerRepo.findByEmail(email);
        if (!row || row.status !== 'active')
            return;
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await officerRepo.saveResetToken(row.id, tokenHash, expiresAt);
        const resetLink = `${env_1.env.frontendUrl}/officer/reset-password?token=${rawToken}&id=${row.id}`;
        await (0, email_1.sendEmail)({ to: row.email, subject: 'ParkSmart — Reset Your Officer Password', html: (0, email_1.passwordResetTemplate)(row.full_name, resetLink), emailType: 'password_reset', relatedId: row.id });
    }
    async resetPassword(body) {
        const { token, officerId, newPassword } = body;
        if (!newPassword || newPassword.length < 8)
            throw new commonErrors_1.ValidationError('Password must be at least 8 characters');
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const row = await officerRepo.findByResetToken(tokenHash, officerId);
        if (!row)
            throw new commonErrors_1.BadRequestError('Invalid or expired reset token');
        const passwordHash = await bcryptjs_1.default.hash(newPassword, env_1.env.bcryptSaltRounds);
        await officerRepo.updatePassword(officerId, passwordHash);
        await authTokenRepo.revokeAllForUser(officerId, 'officer');
    }
}
exports.OfficerAuthService = OfficerAuthService;
exports.officerAuthService = new OfficerAuthService();
//# sourceMappingURL=officerAuth.service.js.map