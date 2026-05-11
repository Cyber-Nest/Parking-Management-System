import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
  createOfficer,
  deleteOfficer,
  getOfficerSummary,
  listOfficers,
  setOfficerStatus,
  updateOfficer,
} from '../controllers/officer.controller';

const router = Router();

const adminOnly = (handler: any) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/summary', ...adminOnly(getOfficerSummary));
router.get('/', ...adminOnly(listOfficers));
router.post('/', ...adminOnly(createOfficer));
router.patch('/:id', ...adminOnly(updateOfficer));
router.patch('/:id/status', ...adminOnly(setOfficerStatus));
router.delete('/:id', ...adminOnly(deleteOfficer));

export default router;

