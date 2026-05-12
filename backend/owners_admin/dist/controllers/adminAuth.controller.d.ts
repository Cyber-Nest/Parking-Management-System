import { Request, Response } from 'express';
import { AuthenticatedRequest, ApiResponse, LoginResponse, AdminPublic } from '../types';
export declare const login: (req: Request, res: Response<ApiResponse<LoginResponse>>) => Promise<void>;
export declare const logout: (req: AuthenticatedRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response<ApiResponse<{
    accessToken: string;
}>>) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response<ApiResponse>) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response<ApiResponse>) => Promise<void>;
export declare const getMe: (req: AuthenticatedRequest, res: Response<ApiResponse<AdminPublic>>) => Promise<void>;
//# sourceMappingURL=adminAuth.controller.d.ts.map