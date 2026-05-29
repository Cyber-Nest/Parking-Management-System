"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOfficerTicketPrint = exports.createOfficerSync = exports.addOfficerTicketEvidence = exports.reviewOfficerTicket = exports.payOfficerTicket = exports.deleteOfficerTicket = exports.updateOfficerTicket = exports.getOfficerTicket = exports.createOfficerTicket = exports.getOfficerVehicleHistory = exports.createOfficerManualEntry = exports.deleteOfficerEvidence = exports.updateOfficerEvidence = exports.captureOfficerEvidence = exports.uploadOfficerPhoto = exports.listOfficerEvidence = exports.listOfficerSessions = exports.listOfficerTickets = exports.scanPlate = exports.getOfficerDashboard = void 0;
const enforcement_service_1 = require("../services/enforcement.service");
const ticket_service_1 = require("../services/ticket.service");
const commonErrors_1 = require("../services/commonErrors");
const ticketService = new ticket_service_1.TicketService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[EnforcementController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const getOfficerDashboard = async (req, res) => {
    try {
        const { resolveOfficerIdWithFallback } = await Promise.resolve().then(() => __importStar(require('../services/officerPortal.service')));
        const { officerPortalService } = await Promise.resolve().then(() => __importStar(require('../services/officerPortal.service')));
        const officerId = await resolveOfficerIdWithFallback(req);
        const [data, shift] = await Promise.all([
            enforcement_service_1.enforcementService.dashboard(officerId),
            officerPortalService.getShiftState(officerId),
        ]);
        res.status(200).json({
            success: true,
            message: 'Officer dashboard fetched',
            data: { ...data, shift },
        });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerDashboard = getOfficerDashboard;
const scanPlate = async (req, res) => {
    try {
        // Support both ?plate= and ?qr= payloads. If qr is provided, attempt to extract a plate.
        const rawQr = String(req.query.qr ?? '').trim();
        let plateQuery = String(req.query.plate ?? req.params.plate ?? '').trim();
        if (!plateQuery && rawQr) {
            // Try JSON: { plate: 'ABC123' }
            try {
                const parsed = JSON.parse(rawQr);
                if (parsed && typeof parsed === 'object') {
                    plateQuery = String(parsed.plate ?? parsed.license_plate ?? parsed.license ?? parsed.lp ?? '').trim();
                }
            }
            catch {
                // not JSON
            }
            // Try URL with query params: https://example/?plate=ABC123
            if (!plateQuery) {
                try {
                    const url = new URL(rawQr);
                    plateQuery = String(url.searchParams.get('plate') ?? url.searchParams.get('license') ?? url.searchParams.get('lp') ?? '').trim();
                }
                catch {
                    // not a URL
                }
            }
            // Fallback: use raw alphanumeric characters from qr payload
            if (!plateQuery) {
                const candidate = rawQr.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (candidate.length >= 2)
                    plateQuery = candidate;
            }
        }
        const data = await enforcement_service_1.enforcementService.scanPlate(plateQuery);
        res.status(200).json({ success: true, message: 'Plate scanned', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.scanPlate = scanPlate;
const listOfficerTickets = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.listTickets(req.query);
        res.status(200).json({ success: true, message: 'Officer tickets fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listOfficerTickets = listOfficerTickets;
const listOfficerSessions = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.listSessions(req.query);
        res.status(200).json({ success: true, message: 'Officer sessions fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listOfficerSessions = listOfficerSessions;
const listOfficerEvidence = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.listEvidence(String(req.query.limit ?? '50'));
        res.status(200).json({ success: true, message: 'Evidence fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listOfficerEvidence = listOfficerEvidence;
const uploadOfficerPhoto = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.uploadPhoto(req.body);
        res.status(201).json({ success: true, message: 'Photo uploaded', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.uploadOfficerPhoto = uploadOfficerPhoto;
const captureOfficerEvidence = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.captureEvidence(req.body);
        res.status(201).json({ success: true, message: 'Evidence captured', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.captureOfficerEvidence = captureOfficerEvidence;
const updateOfficerEvidence = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.updateEvidence(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Evidence updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateOfficerEvidence = updateOfficerEvidence;
const deleteOfficerEvidence = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.deleteEvidence(req.params.id);
        res.status(200).json({ success: true, message: 'Evidence deleted', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteOfficerEvidence = deleteOfficerEvidence;
const createOfficerManualEntry = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.createManualEntry(req.body);
        res.status(201).json({ success: true, message: 'Manual entry created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createOfficerManualEntry = createOfficerManualEntry;
const getOfficerVehicleHistory = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.vehicleHistory(req.params.plate, String(req.query.limit ?? '10'));
        res.status(200).json({ success: true, message: 'Vehicle history fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerVehicleHistory = getOfficerVehicleHistory;
const createOfficerTicket = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.createTicket(req.body);
        res.status(201).json({ success: true, message: 'Ticket issued', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createOfficerTicket = createOfficerTicket;
const getOfficerTicket = async (req, res) => {
    try {
        const data = await ticketService.getById(req.params.id);
        res.status(200).json({ success: true, message: 'Ticket fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerTicket = getOfficerTicket;
const updateOfficerTicket = async (req, res) => {
    try {
        const data = await ticketService.updateTicket(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Ticket updated', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.updateOfficerTicket = updateOfficerTicket;
const deleteOfficerTicket = async (req, res) => {
    try {
        await ticketService.cancelTicket(req.params.id);
        res.status(200).json({ success: true, message: 'Ticket deleted' });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.deleteOfficerTicket = deleteOfficerTicket;
const payOfficerTicket = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.payTicket(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Ticket payment recorded', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.payOfficerTicket = payOfficerTicket;
const reviewOfficerTicket = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.reviewTicket(req.params.id, String(req.body.note ?? '').trim() || undefined);
        res.status(200).json({ success: true, message: 'Ticket sent for review', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.reviewOfficerTicket = reviewOfficerTicket;
const addOfficerTicketEvidence = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.addTicketEvidence(req.params.id, req.body);
        res.status(201).json({ success: true, message: 'Ticket evidence saved', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.addOfficerTicketEvidence = addOfficerTicketEvidence;
// POST /api/officer/sync
const createOfficerSync = async (req, res) => {
    try {
        const items = Array.isArray(req.body) ? req.body : [];
        if (items.length === 0) {
            res.status(400).json({ success: false, message: 'No tickets provided for sync' });
            return;
        }
        const result = await enforcement_service_1.enforcementService.createTicketsBatch(items);
        res.status(200).json({ success: true, message: 'Sync complete', data: result });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createOfficerSync = createOfficerSync;
const getOfficerTicketPrint = async (req, res) => {
    try {
        const data = await enforcement_service_1.enforcementService.getPrintPayload(req.params.id);
        res.status(200).json({ success: true, message: 'Ticket print data fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getOfficerTicketPrint = getOfficerTicketPrint;
//# sourceMappingURL=enforcement.controller.js.map