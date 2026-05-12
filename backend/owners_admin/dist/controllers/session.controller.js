"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionSummary = exports.listSessions = void 0;
const session_service_1 = require("../services/session.service");
const commonErrors_1 = require("../services/commonErrors");
const sessionService = new session_service_1.SessionService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[SessionController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listSessions = async (req, res) => {
    try {
        const data = await sessionService.list(req.query);
        res.status(200).json({ success: true, message: 'Sessions fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listSessions = listSessions;
const getSessionSummary = async (_req, res) => {
    try {
        const data = await sessionService.summary();
        res.status(200).json({ success: true, message: 'Session summary fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getSessionSummary = getSessionSummary;
//# sourceMappingURL=session.controller.js.map