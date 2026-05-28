import { Request, Response } from 'express';
import {
  officerPortalService,
  resolveOfficerId,
} from '../services/officerPortal.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[OfficerPortal]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const getOfficerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.getProfile(officerId);
    res.json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateOfficerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.updateProfile(officerId, req.body);
    res.json({ success: true, message: 'Profile updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getOfficerSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.getSettings(officerId);
    res.json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateOfficerSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.saveSettings(officerId, req.body ?? {});
    res.json({ success: true, message: 'Settings saved', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getOfficerShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.getShiftState(officerId);
    res.json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
};

export const startOfficerShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.startShift(officerId);
    res.status(201).json({ success: true, message: 'Shift started', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const endOfficerShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.endShift(officerId);
    res.json({ success: true, message: 'Shift ended', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const listOfficerOfflineRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.listOffline(officerId);
    res.json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createOfficerOfflineRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.createOffline(officerId, req.body);
    res.status(201).json({ success: true, message: 'Offline record queued', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteOfficerOfflineRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    await officerPortalService.deleteOffline(officerId, req.params.id);
    res.json({ success: true, message: 'Offline record removed' });
  } catch (err) {
    handleError(err, res);
  }
};

export const syncOfficerOfflineRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = resolveOfficerId(req);
    const data = await officerPortalService.syncOffline(officerId);
    res.json({ success: true, message: 'Offline sync complete', data });
  } catch (err) {
    handleError(err, res);
  }
};
