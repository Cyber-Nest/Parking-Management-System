import { Request, Response } from 'express';
export declare class TransactionController {
    createTransaction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTransaction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTransactionByReference(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTransactionsByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    completeTransaction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    failTransaction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTransactionStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getRevenueByDate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTodayRevenue(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const transactionController: TransactionController;
//# sourceMappingURL=transaction.controller.d.ts.map