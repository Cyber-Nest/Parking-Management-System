import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { ReportsService } from '../services/reports.service';
import { ReportExportService } from '../services/reportExport.service';
import { BadRequestError, ValidationError } from '../services/commonErrors';

const reportsService = new ReportsService();
const reportExportService = new ReportExportService();

const handleError = (err: unknown, res: Response): void => {
    if (err instanceof ValidationError || err instanceof BadRequestError) {
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

export const exportReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { format: formatRaw, ...restQuery } = req.query as Record<string, string | undefined>;
        const format = (formatRaw ?? 'excel').toLowerCase();
        if (format !== 'pdf' && format !== 'excel') {
            res.status(400).json({ success: false, message: 'format must be pdf or excel' });
            return;
        }

        const data = await reportsService.getReport(req.params.type, restQuery);
        const parkingLotId = restQuery.parking_lot_id ?? restQuery.parkingLotId ?? restQuery.lotId;
        const { buffer, mime, ext } = await reportExportService.buildBuffer(req.params.type, format, data, parkingLotId);

        const safeName = req.params.type.replace(/[^a-zA-Z0-9-_]/g, '_');
        const stamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}_report_${stamp}.${ext}"`);
        res.setHeader('Content-Length', buffer.length);
        res.status(200).send(buffer);
    } catch (err) {
        handleError(err, res);
    }
};
