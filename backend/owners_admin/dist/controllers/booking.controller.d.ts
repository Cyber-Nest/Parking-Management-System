import { Request, Response } from 'express';
export declare class BookingController {
    createBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBookingByReference(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBookingsByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getActiveBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    confirmBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    markAsActive(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    markAsCompleted(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBookingStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTodayBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const bookingController: BookingController;
//# sourceMappingURL=booking.controller.d.ts.map