import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const listUsers: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const createUser: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const updateUser: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map