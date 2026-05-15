import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const listPayments: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getPaymentSummary: (_req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const createPayment: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getPaymentById: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getPaymentReceipt: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
//# sourceMappingURL=payment.controller.d.ts.map