import { Request, Response } from 'express';
import { ApiResponse, AuthenticatedRequest } from '../types';
import { OfficerService } from '../services/officer.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const officerService = new OfficerService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[OfficerController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const getOfficerById = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await officerService.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Officer fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getOfficerSummary = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await officerService.summary(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Officer summary fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const listOfficers = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await officerService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Officers fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createOfficer = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const data = await officerService.create(authReq.user.id, authReq.body ?? {});
    res.status(201).json({ success: true, message: 'Officer created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateOfficer = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    await officerService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Officer updated' });
  } catch (err) {
    handleError(err, res);
  }
};

export const setOfficerStatus = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const { status } = req.body as { status?: 'ACTIVE' | 'DISABLED' };
    if (!status) {
      res.status(400).json({ success: false, message: 'status is required' });
      return;
    }
    await officerService.setStatus(req.params.id, status);
    res.status(200).json({ success: true, message: 'Officer status updated' });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteOfficer = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    await officerService.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Officer deleted' });
  } catch (err) {
    handleError(err, res);
  }
};

