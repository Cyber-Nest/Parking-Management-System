import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { createTicket, getTicketSummary, listTickets } from '../controllers/ticket.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/', ...adminOnly(listTickets));
router.get('/summary', ...adminOnly(getTicketSummary));
router.post('/', ...adminOnly(createTicket));

export default router;
