import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const login: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response<ApiResponse>) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response<ApiResponse>) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response<ApiResponse<{
    accessToken: string;
}>>) => Promise<void>;
//# sourceMappingURL=officerAuth.controller.d.ts.map