import { Request, Response } from 'express';
export declare class InvoiceController {
    createInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getInvoiceByNumber(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getInvoicesByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    downloadInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    markAsPaid(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getInvoiceStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTodayInvoices(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const invoiceController: InvoiceController;
//# sourceMappingURL=invoice.controller.d.ts.map