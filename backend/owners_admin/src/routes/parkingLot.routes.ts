import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
  listParkingLots,
  getParkingLot,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
} from '../controllers/parkingLot.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/', ...adminOnly(listParkingLots));
router.get('/:id', ...adminOnly(getParkingLot));
router.post('/', ...adminOnly(createParkingLot));
router.patch('/:id', ...adminOnly(updateParkingLot));
router.delete('/:id', ...adminOnly(deleteParkingLot));

export default router;
