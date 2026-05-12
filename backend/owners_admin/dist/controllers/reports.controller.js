"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = void 0;
const reports_service_1 = require("../services/reports.service");
const commonErrors_1 = require("../services/commonErrors");
const reportsService = new reports_service_1.ReportsService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
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
//# sourceMappingURL=reports.controller.js.map