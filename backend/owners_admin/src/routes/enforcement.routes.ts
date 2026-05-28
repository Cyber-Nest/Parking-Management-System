import { Router } from 'express';
import {
  captureOfficerEvidence,
  createOfficerManualEntry,
  createOfficerTicket,
  deleteOfficerTicket,
  deleteOfficerEvidence,
  getOfficerDashboard,
  getOfficerTicket,
  getOfficerTicketPrint,
  getOfficerVehicleHistory,
  listOfficerEvidence,
  listOfficerSessions,
  listOfficerTickets,
  payOfficerTicket,
  reviewOfficerTicket,
  addOfficerTicketEvidence,
  scanPlate,
  updateOfficerTicket,
  updateOfficerEvidence,
  uploadOfficerPhoto,
} from '../controllers/enforcement.controller';
import {
  createOfficerOfflineRecord,
  deleteOfficerOfflineRecord,
  endOfficerShift,
  getOfficerProfile,
  getOfficerSettings,
  getOfficerShift,
  listOfficerOfflineRecords,
  startOfficerShift,
  syncOfficerOfflineRecords,
  updateOfficerProfile,
  updateOfficerSettings,
} from '../controllers/officerPortal.controller';
import { requireOfficer, verifyToken } from '../middleware/auth.middleware';

const router = Router();
const officerAuth = [verifyToken, requireOfficer];

router.get('/dashboard', ...officerAuth, getOfficerDashboard);

router.get('/me/profile', ...officerAuth, getOfficerProfile);
router.patch('/me/profile', ...officerAuth, updateOfficerProfile);
router.get('/me/settings', ...officerAuth, getOfficerSettings);
router.put('/me/settings', ...officerAuth, updateOfficerSettings);
router.get('/me/shift', ...officerAuth, getOfficerShift);
router.post('/me/shift/start', ...officerAuth, startOfficerShift);
router.post('/me/shift/end', ...officerAuth, endOfficerShift);
router.get('/offline-records', ...officerAuth, listOfficerOfflineRecords);
router.post('/offline-records', ...officerAuth, createOfficerOfflineRecord);
router.delete('/offline-records/:id', ...officerAuth, deleteOfficerOfflineRecord);
router.post('/offline-records/sync', ...officerAuth, syncOfficerOfflineRecords);
router.get('/scan', ...officerAuth, scanPlate);
router.get('/scan/:plate', ...officerAuth, scanPlate);
router.get('/tickets', ...officerAuth, listOfficerTickets);
router.post('/tickets', ...officerAuth, createOfficerTicket);
router.get('/tickets/:id', ...officerAuth, getOfficerTicket);
router.patch('/tickets/:id', ...officerAuth, updateOfficerTicket);
router.delete('/tickets/:id', ...officerAuth, deleteOfficerTicket);
router.patch('/tickets/:id/pay', ...officerAuth, payOfficerTicket);
router.patch('/tickets/:id/review', ...officerAuth, reviewOfficerTicket);
router.post('/tickets/:id/evidence', ...officerAuth, addOfficerTicketEvidence);
router.get('/tickets/:id/print', ...officerAuth, getOfficerTicketPrint);
router.get('/sessions', ...officerAuth, listOfficerSessions);
router.get('/evidence', ...officerAuth, listOfficerEvidence);
router.post('/photos', ...officerAuth, uploadOfficerPhoto);
router.post('/evidence', ...officerAuth, captureOfficerEvidence);
router.patch('/evidence/:id', ...officerAuth, updateOfficerEvidence);
router.delete('/evidence/:id', ...officerAuth, deleteOfficerEvidence);
router.post('/manual-entry', ...officerAuth, createOfficerManualEntry);
router.get('/vehicles/:plate/history', ...officerAuth, getOfficerVehicleHistory);

router.post('/sync', ...officerAuth, async (req, res, next) => {
  try {
    const { syncOfficerOfflineRecords } = await import('../controllers/officerPortal.controller');
    return syncOfficerOfflineRecords(req, res);
  } catch (err) {
    return next(err);
  }
});

export default router;
