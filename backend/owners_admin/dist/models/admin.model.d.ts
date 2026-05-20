import { AdminPublic, RoleName } from '../types';
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
/**
 * Maps a DB row to a full Admin object
 */
/**
 * Maps a DB row to a safe public-facing Admin object (no password hash, no tokens)
 */
export declare const toAdminPublic: (row: AdminWithRoleRow) => AdminPublic;
/**
 * Maps a DB row to AdminWithRole (includes role_name)
 */
//# sourceMappingURL=admin.model.d.ts.map