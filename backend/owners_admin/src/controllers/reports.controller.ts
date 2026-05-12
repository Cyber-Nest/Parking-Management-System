import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { ReportsService } from '../services/reports.service';
import { ValidationError } from '../services/commonErrors';

const reportsService = new ReportsService();

const handleError = (err: unknown, res: Response): void => {
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[ReportsController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

export const getReport = async (
    req: Request,
    res: Response<ApiResponse<any>>
): Promise<void> => {
    try {
        const data = await reportsService.getReport(req.params.type, req.query as Record<string, string | undefined>);
        res.status(200).json({ success: true, message: `Report ${req.params.type} fetched`, data });
    } catch (err) {
        handleError(err, res);
    }
};
