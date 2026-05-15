import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { createPayment, getPaymentById, getPaymentReceipt, getPaymentSummary, listPayments } from '../controllers/payment.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/summary', ...adminOnly(getPaymentSummary));
router.get('/:id/receipt', ...adminOnly(getPaymentReceipt));
router.get('/:id', ...adminOnly(getPaymentById));
router.get('/', ...adminOnly(listPayments));
router.post('/', ...adminOnly(createPayment));

export default router;
