import { Request, Response } from 'express';
import { enforcementService } from '../services/enforcement.service';
import { TicketService } from '../services/ticket.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const ticketService = new TicketService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[EnforcementController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const getOfficerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resolveOfficerIdWithFallback } = await import('../services/officerPortal.service');
    const { officerPortalService } = await import('../services/officerPortal.service');
    const officerId = await resolveOfficerIdWithFallback(req);
    const [data, shift] = await Promise.all([
      enforcementService.dashboard(officerId),
      officerPortalService.getShiftState(officerId),
    ]);
    res.status(200).json({
      success: true,
      message: 'Officer dashboard fetched',
      data: { ...data, shift },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const scanPlate = async (req: Request, res: Response): Promise<void> => {
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
      } catch {
        // not JSON
      }

      // Try URL with query params: https://example/?plate=ABC123
      if (!plateQuery) {
        try {
          const url = new URL(rawQr);
          plateQuery = String(url.searchParams.get('plate') ?? url.searchParams.get('license') ?? url.searchParams.get('lp') ?? '').trim();
        } catch {
          // not a URL
        }
      }

      // Fallback: use raw alphanumeric characters from qr payload
      if (!plateQuery) {
        const candidate = rawQr.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (candidate.length >= 2) plateQuery = candidate;
      }
    }

    const data = await enforcementService.scanPlate(plateQuery);
    res.status(200).json({ success: true, message: 'Plate scanned', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const listOfficerTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.listTickets(req.query);
    res.status(200).json({ success: true, message: 'Officer tickets fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const listOfficerSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.listSessions(req.query);
    res.status(200).json({ success: true, message: 'Officer sessions fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const listOfficerEvidence = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.listEvidence(String(req.query.limit ?? '50'));
    res.status(200).json({ success: true, message: 'Evidence fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const uploadOfficerPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.uploadPhoto(req.body);
    res.status(201).json({ success: true, message: 'Photo uploaded', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const captureOfficerEvidence = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.captureEvidence(req.body);
    res.status(201).json({ success: true, message: 'Evidence captured', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateOfficerEvidence = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.updateEvidence(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Evidence updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteOfficerEvidence = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.deleteEvidence(req.params.id);
    res.status(200).json({ success: true, message: 'Evidence deleted', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createOfficerManualEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.createManualEntry(req.body);
    res.status(201).json({ success: true, message: 'Manual entry created', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getOfficerVehicleHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.vehicleHistory(req.params.plate, String(req.query.limit ?? '10'));
    res.status(200).json({ success: true, message: 'Vehicle history fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createOfficerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.createTicket(req.body);
    res.status(201).json({ success: true, message: 'Ticket issued', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getOfficerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await ticketService.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Ticket fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateOfficerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await ticketService.updateTicket(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Ticket updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteOfficerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    await ticketService.cancelTicket(req.params.id);
    res.status(200).json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    handleError(err, res);
  }
};

export const payOfficerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.payTicket(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Ticket payment recorded', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const reviewOfficerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.reviewTicket(req.params.id, String(req.body.note ?? '').trim() || undefined);
    res.status(200).json({ success: true, message: 'Ticket sent for review', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const addOfficerTicketEvidence = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.addTicketEvidence(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Ticket evidence saved', data });
  } catch (err) {
    handleError(err, res);
  }
};

// POST /api/officer/sync
export const createOfficerSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (items.length === 0) {
      res.status(400).json({ success: false, message: 'No tickets provided for sync' });
      return;
    }
    const result = await enforcementService.createTicketsBatch(items as any[]);
    res.status(200).json({ success: true, message: 'Sync complete', data: result });
  } catch (err) {
    handleError(err, res);
  }
};

export const getOfficerTicketPrint = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await enforcementService.getPrintPayload(req.params.id);
    res.status(200).json({ success: true, message: 'Ticket print data fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};
