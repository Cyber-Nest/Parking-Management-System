"use strict";
// src/models/admin.model.ts
// Defines the Admin data shape and maps raw DB rows to typed objects
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAdminPublic = void 0;
// ─── Mappers ─────────────────────────────────────────────────
/**
 * Maps a DB row to a full Admin object
 */
// export const toAdmin = (row: AdminRow): Admin => ({
//     id: row.id,
//     email: row.email,
//     password_hash: row.password_hash,
//     full_name: row.full_name,
//     role_id: row.role_id,
//     is_active: row.is_active,
//     reset_token: row.reset_token,
//     reset_token_expires_at: row.reset_token_expires_at,
//     last_login_at: row.last_login_at,
//     created_at: row.created_at,
//     updated_at: row.updated_at,
// });
/**
 * Maps a DB row to a safe public-facing Admin object (no password hash, no tokens)
 */
const toAdminPublic = (row) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role_name,
    is_active: row.is_active,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
});
exports.toAdminPublic = toAdminPublic;
/**
 * Maps a DB row to AdminWithRole (includes role_name)
 */
// export const toAdminWithRole = (row: AdminWithRoleRow): AdminWithRole => ({
//     ...toAdmin(row),
//     role_name: row.role_name,
// });
//# sourceMappingURL=admin.model.js.map