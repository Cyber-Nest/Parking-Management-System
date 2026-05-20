import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
  addTicketNote,
  cancelTicket,
  createTicket,
  getTicketById,
  getTicketPrint,
  getTicketSummary,
  listTickets,
  markTicketPaid,
  updateTicket,
} from '../controllers/ticket.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/summary', ...adminOnly(getTicketSummary));
router.get('/:id/print', ...adminOnly(getTicketPrint));
router.get('/:id', ...adminOnly(getTicketById));
router.patch('/:id/mark-paid', ...adminOnly(markTicketPaid));
router.patch('/:id/cancel', ...adminOnly(cancelTicket));
router.patch('/:id/note', ...adminOnly(addTicketNote));
router.patch('/:id', ...adminOnly(updateTicket));
router.get('/', ...adminOnly(listTickets));
router.post('/', ...adminOnly(createTicket));

export default router;
