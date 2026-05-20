import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { SessionService } from '../services/session.service';
import { ValidationError } from '../services/commonErrors';

const sessionService = new SessionService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[SessionController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listSessions = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await sessionService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Sessions fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getSessionSummary = async (
  _req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await sessionService.summary();
    res.status(200).json({ success: true, message: 'Session summary fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

