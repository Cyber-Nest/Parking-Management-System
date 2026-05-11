// src/repositories/admin.repository.ts
import { queryRows, execute } from '../config/database';
import { AdminWithRoleRow, AdminRow, AuthTokenRow } from '../models/admin.model';
import crypto from 'crypto';

export class AdminRepository {
  async findByEmail(email: string): Promise<AdminWithRoleRow | null> {
    const rows = await queryRows<AdminWithRoleRow>(
      `SELECT a.*, r.name AS role_name FROM admins a
       JOIN roles r ON a.role_id = r.id
       WHERE a.email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<AdminWithRoleRow | null> {
    const rows = await queryRows<AdminWithRoleRow>(
      `SELECT a.*, r.name AS role_name FROM admins a
       JOIN roles r ON a.role_id = r.id
       WHERE a.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByResetToken(tokenHash: string, adminId: string): Promise<AdminRow | null> {
    const rows = await queryRows<AdminRow>(
      `SELECT * FROM admins
       WHERE id = ? AND reset_token = ? AND reset_token_expires_at > NOW() LIMIT 1`,
      [adminId, tokenHash]
    );
    return rows[0] ?? null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await execute(`UPDATE admins SET last_login_at = NOW() WHERE id = ?`, [id]);
  }

  async saveResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await execute(
      `UPDATE admins SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?`,
      [tokenHash, expiresAt, id]
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await execute(
      `UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?`,
      [passwordHash, id]
    );
  }

  async create(params: { email: string; passwordHash: string; fullName: string; roleId: string; }): Promise<string | null> {
    const id = crypto.randomUUID();
    const result = await execute(
      `INSERT IGNORE INTO admins (id, email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?, ?)`,
      [id, params.email.toLowerCase().trim(), params.passwordHash, params.fullName, params.roleId]
    );
    return result.affectedRows > 0 ? id : null;
  }

 /*  async findRoleId(roleName: string): Promise<string | null> {
    const rows = await queryRows<RoleRow>(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [roleName]);
    return rows[0]?.id ?? null;
  } */
}

export class AuthTokenRepository {
  async create(params: { userId: string; userType: string; refreshToken: string; expiresAt: Date; }): Promise<void> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO auth_tokens (id, user_id, user_type, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?)`,
      [id, params.userId, params.userType, params.refreshToken, params.expiresAt]
    );
  }

  async revoke(refreshToken: string, userId: string): Promise<number> {
    const result = await execute(
      `UPDATE auth_tokens SET revoked = 1 WHERE refresh_token = ? AND user_id = ? AND revoked = 0`,
      [refreshToken, userId]
    );
    return result.affectedRows;
  }

  async revokeAllForUser(userId: string, userType: string): Promise<void> {
    await execute(
      `UPDATE auth_tokens SET revoked = 1 WHERE user_id = ? AND user_type = ?`,
      [userId, userType]
    );
  }

  async findValid(refreshToken: string): Promise<AuthTokenRow | null> {
    const rows = await queryRows<AuthTokenRow>(
      `SELECT * FROM auth_tokens WHERE refresh_token = ? AND revoked = 0 AND expires_at > NOW() LIMIT 1`,
      [refreshToken]
    );
    return rows[0] ?? null;
  }
}