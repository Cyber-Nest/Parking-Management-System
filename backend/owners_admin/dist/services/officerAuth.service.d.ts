import { LoginBody, ForgotPasswordBody, ResetPasswordBody, LoginResponse } from '../types';
export declare class OfficerAuthService {
    login(body: LoginBody): Promise<LoginResponse>;
    logout(refreshToken: string, officerId: string): Promise<void>;
    refreshAccessToken(refreshToken: string): Promise<string>;
    forgotPassword(body: ForgotPasswordBody): Promise<void>;
    resetPassword(body: ResetPasswordBody): Promise<void>;
}
export declare const officerAuthService: OfficerAuthService;
//# sourceMappingURL=officerAuth.service.d.ts.map