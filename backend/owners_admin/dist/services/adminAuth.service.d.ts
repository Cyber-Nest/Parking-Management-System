import { LoginBody, ForgotPasswordBody, ResetPasswordBody, LoginResponse, AdminPublic } from '../types';
export declare class AdminAuthService {
    login(body: LoginBody): Promise<LoginResponse>;
    logout(refreshToken: string, adminId: string): Promise<void>;
    refreshAccessToken(refreshToken: string): Promise<string>;
    forgotPassword(body: ForgotPasswordBody): Promise<void>;
    resetPassword(body: ResetPasswordBody): Promise<void>;
    getMe(adminId: string): Promise<AdminPublic>;
}
//# sourceMappingURL=adminAuth.service.d.ts.map