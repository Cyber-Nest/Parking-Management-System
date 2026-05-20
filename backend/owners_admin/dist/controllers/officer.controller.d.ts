import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const getOfficerById: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getOfficerSummary: (_req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const listOfficers: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const createOfficer: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const updateOfficer: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const setOfficerStatus: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const deleteOfficer: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
//# sourceMappingURL=officer.controller.d.ts.map