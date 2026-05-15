import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const listTaxes: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const createTax: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const updateTax: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const deleteTax: (req: Request, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=tax.controller.d.ts.map