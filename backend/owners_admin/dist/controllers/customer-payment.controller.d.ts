import { Request, Response } from 'express';
export declare class CustomerPaymentController {
    /**
     * Create a payment intent for customer bookings
     */
    createPaymentIntent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Submit booking after payment
     */
    submitBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get parking zones
     */
    getParkingZone(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get Stripe config
     */
    getConfig(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get booking details with invoice
     */
    getBookingDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const customerPaymentController: CustomerPaymentController;
//# sourceMappingURL=customer-payment.controller.d.ts.map