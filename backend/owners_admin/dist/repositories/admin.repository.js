"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokenRepository = exports.AdminRepository = void 0;
// src/repositories/admin.repository.ts
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
class AdminRepository {
    async findByEmail(email) {
        const rows = await (0, database_1.queryRows)(`SELECT a.*, r.name AS role_name FROM admins a
       JOIN roles r ON a.role_id = r.id
       WHERE a.email = ? LIMIT 1`, [email.toLowerCase().trim()]);
        return rows[0] ?? null;
    }
    async findById(id) {
        const rows = await (0, database_1.queryRows)(`SELECT a.*, r.name AS role_name FROM admins a
       JOIN roles r ON a.role_id = r.id
       WHERE a.id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async findByResetToken(tokenHash, adminId) {
        const rows = await (0, database_1.queryRows)(`SELECT * FROM admins
       WHERE id = ? AND reset_token = ? AND reset_token_expires_at > NOW() LIMIT 1`, [adminId, tokenHash]);
        return rows[0] ?? null;
    }
    async updateLastLogin(id) {
        await (0, database_1.execute)(`UPDATE admins SET last_login_at = NOW() WHERE id = ?`, [id]);
    }
    async saveResetToken(id, tokenHash, expiresAt) {
        await (0, database_1.execute)(`UPDATE admins SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?`, [tokenHash, expiresAt, id]);
    }
    async updatePassword(id, passwordHash) {
        await (0, database_1.execute)(`UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?`, [passwordHash, id]);
    }
    async create(params) {
        const id = crypto_1.default.randomUUID();
        const result = await (0, database_1.execute)(`INSERT IGNORE INTO admins (id, email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?, ?)`, [id, params.email.toLowerCase().trim(), params.passwordHash, params.fullName, params.roleId]);
        return result.affectedRows > 0 ? id : null;
    }
}
exports.AdminRepository = AdminRepository;
class AuthTokenRepository {
    async create(params) {
        const id = crypto_1.default.randomUUID();
        await (0, database_1.execute)(`INSERT INTO auth_tokens (id, user_id, user_type, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?)`, [id, params.userId, params.userType, params.refreshToken, params.expiresAt]);
    }
    async revoke(refreshToken, userId) {
        const result = await (0, database_1.execute)(`UPDATE auth_tokens SET revoked = 1 WHERE refresh_token = ? AND user_id = ? AND revoked = 0`, [refreshToken, userId]);
        return result.affectedRows;
    }
    async revokeAllForUser(userId, userType) {
        await (0, database_1.execute)(`UPDATE auth_tokens SET revoked = 1 WHERE user_id = ? AND user_type = ?`, [userId, userType]);
    }
    async findValid(refreshToken) {
        const rows = await (0, database_1.queryRows)(`SELECT * FROM auth_tokens WHERE refresh_token = ? AND revoked = 0 AND expires_at > NOW() LIMIT 1`, [refreshToken]);
        return rows[0] ?? null;
    }
}
exports.AuthTokenRepository = AuthTokenRepository;
//# sourceMappingURL=admin.repository.js.map