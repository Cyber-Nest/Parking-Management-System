import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { TicketService } from '../services/ticket.service';
import { NotFoundError, ValidationError } from '../services/commonErrors';

const ticketService = new TicketService();

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
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

export const getTicketById = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const data = await ticketService.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Ticket fetched', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const getTicketPrint = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const ticket = await ticketService.getById(req.params.id);
    const data = ticketService.getPrintPayload(ticket);
    res.status(200).json({ success: true, message: 'Ticket print data', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateTicket = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const data = await ticketService.updateTicket(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Ticket updated', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const markTicketPaid = async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const data = await ticketService.markPaid(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Ticket marked paid', data });
  } catch (err) {
    handleError(err, res);
  }
};

export const cancelTicket = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    await ticketService.cancelTicket(req.params.id);
    res.status(200).json({ success: true, message: 'Ticket cancelled' });
  } catch (err) {
    handleError(err, res);
  }
};

export const addTicketNote = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { note } = req.body as { note?: string };
    if (!note?.trim()) {
      res.status(400).json({ success: false, message: 'note is required' });
      return;
    }
    await ticketService.addNote(req.params.id, note);
    res.status(200).json({ success: true, message: 'Note saved' });
  } catch (err) {
    handleError(err, res);
  }
};
