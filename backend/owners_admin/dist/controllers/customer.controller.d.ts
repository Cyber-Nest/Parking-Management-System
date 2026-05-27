import { Request, Response } from 'express';
import { ApiResponse, CustomerBookingResponse, ParkingZonePublic } from '../types';
export declare const getParkingZoneById: (req: Request, res: Response<ApiResponse<ParkingZonePublic>>) => Promise<void>;
export declare const getStripeConfig: (_req: Request, res: Response<ApiResponse<{
    stripePublishableKey: string;
}>>) => Promise<void>;
export declare const createPaymentIntent: (req: Request, res: Response<ApiResponse<{
    clientSecret: string;
    amount: number;
    currency: string;
}>>) => Promise<void>;
export declare const createBooking: (req: Request, res: Response<ApiResponse<CustomerBookingResponse>>) => Promise<void>;
export declare const getCustomerBooking: (req: Request, res: Response) => Promise<void>;
export declare const getCustomerBookingByReference: (req: Request, res: Response) => Promise<void>;
export declare const extendCustomerBooking: (req: Request, res: Response) => Promise<void>;
export declare const getPenaltyByTicketNumber: (req: Request, res: Response) => Promise<void>;
export declare const payPenaltyTicket: (req: Request, res: Response) => Promise<void>;
export declare const disputePenaltyTicket: (req: Request, res: Response) => Promise<void>;
export declare const downloadCustomerInvoice: (req: Request, res: Response) => Promise<void>;
export declare const downloadPenaltyReceipt: (req: Request, res: Response) => Promise<void>;
export declare const getCustomerInvoice: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=customer.controller.d.ts.map