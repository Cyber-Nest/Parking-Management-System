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
const express_1 = require("express");
const enforcement_controller_1 = require("../controllers/enforcement.controller");
const officerPortal_controller_1 = require("../controllers/officerPortal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const officerAuth = [auth_middleware_1.verifyToken, auth_middleware_1.requireOfficer];
router.get('/dashboard', ...officerAuth, enforcement_controller_1.getOfficerDashboard);
router.get('/me/profile', ...officerAuth, officerPortal_controller_1.getOfficerProfile);
router.patch('/me/profile', ...officerAuth, officerPortal_controller_1.updateOfficerProfile);
router.get('/me/settings', ...officerAuth, officerPortal_controller_1.getOfficerSettings);
router.put('/me/settings', ...officerAuth, officerPortal_controller_1.updateOfficerSettings);
router.get('/me/shift', ...officerAuth, officerPortal_controller_1.getOfficerShift);
router.post('/me/shift/start', ...officerAuth, officerPortal_controller_1.startOfficerShift);
router.post('/me/shift/end', ...officerAuth, officerPortal_controller_1.endOfficerShift);
router.get('/offline-records', ...officerAuth, officerPortal_controller_1.listOfficerOfflineRecords);
router.post('/offline-records', ...officerAuth, officerPortal_controller_1.createOfficerOfflineRecord);
router.delete('/offline-records/:id', ...officerAuth, officerPortal_controller_1.deleteOfficerOfflineRecord);
router.post('/offline-records/sync', ...officerAuth, officerPortal_controller_1.syncOfficerOfflineRecords);
router.get('/scan', ...officerAuth, enforcement_controller_1.scanPlate);
router.get('/scan/:plate', ...officerAuth, enforcement_controller_1.scanPlate);
router.get('/tickets', ...officerAuth, enforcement_controller_1.listOfficerTickets);
router.post('/tickets', ...officerAuth, enforcement_controller_1.createOfficerTicket);
router.get('/tickets/:id', ...officerAuth, enforcement_controller_1.getOfficerTicket);
router.patch('/tickets/:id', ...officerAuth, enforcement_controller_1.updateOfficerTicket);
router.delete('/tickets/:id', ...officerAuth, enforcement_controller_1.deleteOfficerTicket);
router.patch('/tickets/:id/pay', ...officerAuth, enforcement_controller_1.payOfficerTicket);
router.patch('/tickets/:id/review', ...officerAuth, enforcement_controller_1.reviewOfficerTicket);
router.post('/tickets/:id/evidence', ...officerAuth, enforcement_controller_1.addOfficerTicketEvidence);
router.get('/tickets/:id/print', ...officerAuth, enforcement_controller_1.getOfficerTicketPrint);
router.get('/sessions', ...officerAuth, enforcement_controller_1.listOfficerSessions);
router.get('/evidence', ...officerAuth, enforcement_controller_1.listOfficerEvidence);
router.post('/photos', ...officerAuth, enforcement_controller_1.uploadOfficerPhoto);
router.post('/evidence', ...officerAuth, enforcement_controller_1.captureOfficerEvidence);
router.patch('/evidence/:id', ...officerAuth, enforcement_controller_1.updateOfficerEvidence);
router.delete('/evidence/:id', ...officerAuth, enforcement_controller_1.deleteOfficerEvidence);
router.post('/manual-entry', ...officerAuth, enforcement_controller_1.createOfficerManualEntry);
router.get('/vehicles/:plate/history', ...officerAuth, enforcement_controller_1.getOfficerVehicleHistory);
router.post('/sync', ...officerAuth, async (req, res, next) => {
    try {
        const { syncOfficerOfflineRecords } = await Promise.resolve().then(() => __importStar(require('../controllers/officerPortal.controller')));
        return syncOfficerOfflineRecords(req, res);
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
//# sourceMappingURL=enforcement.routes.js.map