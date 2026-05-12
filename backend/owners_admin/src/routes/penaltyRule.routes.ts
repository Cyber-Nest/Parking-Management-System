import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
  createPenaltyRule,
  deletePenaltyRule,
  listPenaltyRules,
  updatePenaltyRule,
} from '../controllers/penaltyRule.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/', ...adminOnly(listPenaltyRules));
router.post('/', ...adminOnly(createPenaltyRule));
router.patch('/:id', ...adminOnly(updatePenaltyRule));
router.delete('/:id', ...adminOnly(deletePenaltyRule));

export default router;

