"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = exports.getReport = void 0;
const reports_service_1 = require("../services/reports.service");
const reportExport_service_1 = require("../services/reportExport.service");
const commonErrors_1 = require("../services/commonErrors");
const reportsService = new reports_service_1.ReportsService();
const reportExportService = new reportExport_service_1.ReportExportService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.BadRequestError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[ReportsController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const getReport = async (req, res) => {
    try {
        const data = await reportsService.getReport(req.params.type, req.query);
        res.status(200).json({ success: true, message: `Report ${req.params.type} fetched`, data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getReport = getReport;
const exportReport = async (req, res) => {
    try {
        const { format: formatRaw, ...restQuery } = req.query;
        const format = (formatRaw ?? 'excel').toLowerCase();
        if (format !== 'pdf' && format !== 'excel') {
            res.status(400).json({ success: false, message: 'format must be pdf or excel' });
            return;
        }
        const data = await reportsService.getReport(req.params.type, restQuery);
        const { buffer, mime, ext } = await reportExportService.buildBuffer(req.params.type, format, data);
        const safeName = req.params.type.replace(/[^a-zA-Z0-9-_]/g, '_');
        const stamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}_report_${stamp}.${ext}"`);
        res.setHeader('Content-Length', buffer.length);
        res.status(200).send(buffer);
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.exportReport = exportReport;
//# sourceMappingURL=reports.controller.js.map