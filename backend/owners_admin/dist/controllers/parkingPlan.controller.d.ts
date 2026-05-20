import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const listParkingPlans: (_req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const createParkingPlan: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const updateParkingPlan: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const deleteParkingPlan: (req: Request, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=parkingPlan.controller.d.ts.map