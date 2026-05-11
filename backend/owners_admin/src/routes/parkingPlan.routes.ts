import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
  listParkingPlans,
  createParkingPlan,
  updateParkingPlan,
  deleteParkingPlan,
} from '../controllers/parkingPlan.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/', ...adminOnly(listParkingPlans));
router.post('/', ...adminOnly(createParkingPlan));
router.patch('/:id', ...adminOnly(updateParkingPlan));
router.delete('/:id', ...adminOnly(deleteParkingPlan));

export default router;
