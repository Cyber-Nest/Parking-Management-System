import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { TicketService } from '../services/ticket.service';
import { ValidationError } from '../services/commonErrors';

const ticketService = new TicketService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[TicketController] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const listTickets = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await ticketService.list(req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, message: 'Tickets fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getTicketSummary = async (
  _req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await ticketService.summary();
    res.status(200).json({ success: true, message: 'Ticket summary fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const createTicket = async (
  req: Request,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const data = await ticketService.create(req.body);
    res.status(201).json({ success: true, message: 'Ticket created', data });
  } catch (err) {
    handleError(err, res);
  }
};
