import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const listTickets: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getTicketSummary: (_req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const createTicket: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getTicketById: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getTicketPrint: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const updateTicket: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const markTicketPaid: (req: Request, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const cancelTicket: (req: Request, res: Response<ApiResponse>) => Promise<void>;
export declare const addTicketNote: (req: Request, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=ticket.controller.d.ts.map