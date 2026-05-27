"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOfficerOfflineRecords = exports.deleteOfficerOfflineRecord = exports.createOfficerOfflineRecord = exports.listOfficerOfflineRecords = exports.endOfficerShift = exports.startOfficerShift = exports.getOfficerShift = exports.updateOfficerSettings = exports.getOfficerSettings = exports.updateOfficerProfile = exports.getOfficerProfile = void 0;
const officerPortal_service_1 = require("../services/officerPortal.service");
const commonErrors_1 = require("../services/commonErrors");
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    if (err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[OfficerPortal]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const getOfficerProfile = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.getProfile(officerId);
        res.json({ success: true, data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerProfile = getOfficerProfile;
const updateOfficerProfile = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.updateProfile(officerId, req.body);
        res.json({ success: true, message: 'Profile updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateOfficerProfile = updateOfficerProfile;
const getOfficerSettings = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.getSettings(officerId);
        res.json({ success: true, data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerSettings = getOfficerSettings;
const updateOfficerSettings = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.saveSettings(officerId, req.body ?? {});
        res.json({ success: true, message: 'Settings saved', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateOfficerSettings = updateOfficerSettings;
const getOfficerShift = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.getShiftState(officerId);
        res.json({ success: true, data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerShift = getOfficerShift;
const startOfficerShift = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.startShift(officerId);
        res.status(201).json({ success: true, message: 'Shift started', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.startOfficerShift = startOfficerShift;
const endOfficerShift = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.endShift(officerId);
        res.json({ success: true, message: 'Shift ended', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.endOfficerShift = endOfficerShift;
const listOfficerOfflineRecords = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.listOffline(officerId);
        res.json({ success: true, data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listOfficerOfflineRecords = listOfficerOfflineRecords;
const createOfficerOfflineRecord = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.createOffline(officerId, req.body);
        res.status(201).json({ success: true, message: 'Offline record queued', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createOfficerOfflineRecord = createOfficerOfflineRecord;
const deleteOfficerOfflineRecord = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        await officerPortal_service_1.officerPortalService.deleteOffline(officerId, req.params.id);
        res.json({ success: true, message: 'Offline record removed' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteOfficerOfflineRecord = deleteOfficerOfflineRecord;
const syncOfficerOfflineRecords = async (req, res) => {
    try {
        const officerId = (0, officerPortal_service_1.resolveOfficerId)(req);
        const data = await officerPortal_service_1.officerPortalService.syncOffline(officerId);
        res.json({ success: true, message: 'Offline sync complete', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.syncOfficerOfflineRecords = syncOfficerOfflineRecords;
//# sourceMappingURL=officerPortal.controller.js.map