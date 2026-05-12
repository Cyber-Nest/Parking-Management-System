"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOfficer = exports.setOfficerStatus = exports.updateOfficer = exports.createOfficer = exports.listOfficers = exports.getOfficerSummary = void 0;
const officer_service_1 = require("../services/officer.service");
const commonErrors_1 = require("../services/commonErrors");
const officerService = new officer_service_1.OfficerService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[OfficerController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const getOfficerSummary = async (_req, res) => {
    try {
        const data = await officerService.summary();
        res.status(200).json({ success: true, message: 'Officer summary fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerSummary = getOfficerSummary;
const listOfficers = async (req, res) => {
    try {
        const data = await officerService.list(req.query);
        res.status(200).json({ success: true, message: 'Officers fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listOfficers = listOfficers;
const createOfficer = async (req, res) => {
    try {
        const data = await officerService.create(req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Officer created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createOfficer = createOfficer;
const updateOfficer = async (req, res) => {
    try {
        await officerService.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Officer updated' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateOfficer = updateOfficer;
const setOfficerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ success: false, message: 'status is required' });
            return;
        }
        await officerService.setStatus(req.params.id, status);
        res.status(200).json({ success: true, message: 'Officer status updated' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.setOfficerStatus = setOfficerStatus;
const deleteOfficer = async (req, res) => {
    try {
        await officerService.remove(req.params.id);
        res.status(200).json({ success: true, message: 'Officer deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteOfficer = deleteOfficer;
//# sourceMappingURL=officer.controller.js.map