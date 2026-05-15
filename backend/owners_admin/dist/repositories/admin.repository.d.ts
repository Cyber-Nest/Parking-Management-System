import { AdminWithRoleRow, AdminRow, AuthTokenRow } from '../models/admin.model';
export declare class AdminRepository {
    findByEmail(email: string): Promise<AdminWithRoleRow | null>;
    findById(id: string): Promise<AdminWithRoleRow | null>;
    findByResetToken(tokenHash: string, adminId: string): Promise<AdminRow | null>;
    updateLastLogin(id: string): Promise<void>;
    saveResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
    create(params: {
        email: string;
        passwordHash: string;
        fullName: string;
        roleId: string;
    }): Promise<string | null>;
    insertAdmin(params: {
        email: string;
        passwordHash: string;
        fullName: string;
        roleId: string;
    }): Promise<string>;
}
export declare class AuthTokenRepository {
    create(params: {
        userId: string;
        userType: string;
        refreshToken: string;
        expiresAt: Date;
    }): Promise<void>;
    revoke(refreshToken: string, userId: string): Promise<number>;
    revokeAllForUser(userId: string, userType: string): Promise<void>;
    findValid(refreshToken: string): Promise<AuthTokenRow | null>;
}
//# sourceMappingURL=admin.repository.d.ts.map