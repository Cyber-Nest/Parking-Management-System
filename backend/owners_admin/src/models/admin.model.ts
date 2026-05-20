// src/models/admin.model.ts
// Defines the Admin data shape and maps raw DB rows to typed objects

import {  AdminPublic, RoleName } from '../types';

// ─── Raw DB row types (what pg returns) ──────────────────────

export interface AdminRow {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    role_id: string;
    is_active: boolean;
    reset_token: string | null;
    reset_token_expires_at: Date | null;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface AdminWithRoleRow extends AdminRow {
    role_name: RoleName;
}

export interface AuthTokenRow {
    id: string;
    user_id: string;
    user_type: string;
    refresh_token: string;
    expires_at: Date;
    revoked: boolean;
    created_at: Date;
}

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
export const toAdminPublic = (row: AdminWithRoleRow): AdminPublic => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role_name,
    is_active: row.is_active,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
});

/**
 * Maps a DB row to AdminWithRole (includes role_name)
 */
// export const toAdminWithRole = (row: AdminWithRoleRow): AdminWithRole => ({
//     ...toAdmin(row),
//     role_name: row.role_name,
// });