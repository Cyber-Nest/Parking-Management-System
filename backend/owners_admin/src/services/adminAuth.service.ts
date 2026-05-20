// src/services/adminAuth.service.ts
// Business logic for admin authentication — sits between controller and repository

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AdminRepository, AuthTokenRepository } from '../repositories/admin.repository';
import { toAdminPublic } from '../models/admin.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendEmail, passwordResetTemplate } from '../utils/email';
import { env } from '../config/env';
import {
    UnauthorizedError,
    ForbiddenError,
    BadRequestError,
    ValidationError,
    NotFoundError,
} from './commonErrors';
import {
    LoginBody,
    ForgotPasswordBody,
    ResetPasswordBody,
    LoginResponse,
    AdminPublic,
    JwtPayload,
} from '../types';

const adminRepo = new AdminRepository();
const authTokenRepo = new AuthTokenRepository();

export class AdminAuthService {
    // ─── LOGIN ─────────────────────────────────────────────────

    async login(body: LoginBody): Promise<LoginResponse> {
        const { email, password } = body;

        // 1. Find admin
        const row = await adminRepo.findByEmail(email);
        if (!row) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 2. Check active
        if (!row.is_active) {
            throw new ForbiddenError('Account is deactivated. Contact support.');
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, row.password_hash);
        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 4. Build token payload
        const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
            id: row.id,
            email: row.email,
            userType: 'admin',
            role: row.role_name,
        };

        // 5. Sign tokens
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

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
            admin: toAdminPublic(row),
        };
    }

    // ─── LOGOUT ────────────────────────────────────────────────

    async logout(refreshToken: string, adminId: string): Promise<void> {
        // Revoke refresh token — don't throw if already revoked (idempotent)
        await authTokenRepo.revoke(refreshToken, adminId);
    }

    // ─── REFRESH ACCESS TOKEN ──────────────────────────────────

    async refreshAccessToken(refreshToken: string): Promise<string> {
        // 1. Verify JWT signature
        let decoded: JwtPayload;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        // 2. Check token still valid in DB (not revoked)
        const stored = await authTokenRepo.findValid(refreshToken);
        if (!stored) {
            throw new UnauthorizedError('Refresh token has been revoked or expired');
        }

        // 3. Issue new access token
        return signAccessToken({
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType,
            role: decoded.role,
        });
    }

    // ─── FORGOT PASSWORD ───────────────────────────────────────

    async forgotPassword(body: ForgotPasswordBody): Promise<void> {
        const { email } = body;

        const row = await adminRepo.findByEmail(email);
        // Always succeed silently — prevents email enumeration
        if (!row || !row.is_active) return;

        // Generate raw token (sent to user) and hash (stored in DB)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await adminRepo.saveResetToken(row.id, tokenHash, expiresAt);

        const resetLink = `${env.frontendUrl}/admin/reset-password?token=${rawToken}&id=${row.id}`;

        await sendEmail({
            to: row.email,
            subject: 'ParkSmart — Reset Your Admin Password',
            html: passwordResetTemplate(row.full_name, resetLink),
            emailType: 'password_reset',
            relatedId: row.id,
        });
    }

    // ─── RESET PASSWORD ────────────────────────────────────────

    async resetPassword(body: ResetPasswordBody): Promise<void> {
        const { token, adminId, newPassword } = body;

        if (newPassword.length < 8) {
            throw new ValidationError('Password must be at least 8 characters');
        }

        // Hash the incoming raw token to compare with DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const row = await adminRepo.findByResetToken(tokenHash, adminId);
        if (!row) {
            throw new BadRequestError('Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
        await adminRepo.updatePassword(adminId, passwordHash);

        // Force re-login everywhere
        await authTokenRepo.revokeAllForUser(adminId, 'admin');
    }

    // ─── GET ME ────────────────────────────────────────────────

    async getMe(adminId: string): Promise<AdminPublic> {
        const row = await adminRepo.findById(adminId);
        if (!row) {
            throw new NotFoundError('Admin not found');
        }
        return toAdminPublic(row);
    }
}