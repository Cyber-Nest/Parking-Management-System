import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OfficerRepository } from '../repositories/officer.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendEmail, passwordResetTemplate } from '../utils/email';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError, BadRequestError, ValidationError } from './commonErrors';
import { LoginBody, ForgotPasswordBody, ResetPasswordBody, LoginResponse, JwtPayload } from '../types';

const officerRepo = new OfficerRepository();
// We'll import AuthTokenRepository from admin.repository to reuse token storage
import { AuthTokenRepository as AdminAuthTokenRepo } from '../repositories/admin.repository';
const authTokenRepo = new AdminAuthTokenRepo();

export class OfficerAuthService {
  async login(body: LoginBody): Promise<LoginResponse> {
    const { email, password } = body;

    const row = await officerRepo.findByEmail(email);
    
    if (!row) throw new UnauthorizedError('Invalid email');

    if (row.status !== 'active') {
      throw new ForbiddenError('Account is deactivated. Contact support.');
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    if (!isMatch) throw new UnauthorizedError('Invalid password');

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      id: row.id,
      email: row.email,
      userType: 'officer',
      role: 'officer',
    } as any;

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authTokenRepo.create({ userId: row.id, userType: 'officer', refreshToken, expiresAt });

    await officerRepo.updateLastLogin(row.id);

    const officerRow = row as {
      id: string;
      full_name: string;
      email: string;
      phone?: string | null;
      badge_number?: string | null;
      role?: string;
    };

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
    } as unknown as LoginResponse;
  }

  async logout(refreshToken: string, officerId: string): Promise<void> {
    await authTokenRepo.revoke(refreshToken, officerId);
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const stored = await authTokenRepo.findValid(refreshToken);
    if (!stored) throw new UnauthorizedError('Refresh token has been revoked or expired');

    return signAccessToken({ id: decoded.id, email: decoded.email, userType: decoded.userType, role: decoded.role });
  }

  async forgotPassword(body: ForgotPasswordBody): Promise<void> {
    const { email } = body;
    const row = await officerRepo.findByEmail(email);
    if (!row || row.status !== 'active') return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await officerRepo.saveResetToken(row.id, tokenHash, expiresAt);

    const resetLink = `${env.frontendUrl}/officer/reset-password?token=${rawToken}&id=${row.id}`;
    await sendEmail({ to: row.email, subject: 'ParkSmart — Reset Your Officer Password', html: passwordResetTemplate(row.full_name, resetLink), emailType: 'password_reset', relatedId: row.id });
  }

  async resetPassword(body: ResetPasswordBody): Promise<void> {
    const { token, officerId, newPassword } = body as any;
    if (!newPassword || newPassword.length < 8) throw new ValidationError('Password must be at least 8 characters');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const row = await officerRepo.findByResetToken(tokenHash, officerId);
    if (!row) throw new BadRequestError('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
    await officerRepo.updatePassword(officerId, passwordHash);

    await authTokenRepo.revokeAllForUser(officerId, 'officer');
  }
}

export const officerAuthService = new OfficerAuthService();
