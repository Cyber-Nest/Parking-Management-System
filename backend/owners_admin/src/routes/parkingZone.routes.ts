import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
  listParkingZones,
  getParkingZone,
  createParkingZone,
  updateParkingZone,
  deleteParkingZone,
} from '../controllers/parkingZone.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

router.get('/', ...adminOnly(listParkingZones));
router.get('/:id', ...adminOnly(getParkingZone));
router.post('/', ...adminOnly(createParkingZone));
router.patch('/:id', ...adminOnly(updateParkingZone));
router.delete('/:id', ...adminOnly(deleteParkingZone));

export default router;
