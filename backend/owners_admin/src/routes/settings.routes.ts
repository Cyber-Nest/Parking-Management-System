import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import {
    getSystemSettings,
    updateSystemSettings,
    getBrandingSettings,
    updateBrandingSettings,
} from '../controllers/settings.controller';

const router = Router();

const adminOnly = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
        verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
        requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
        handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
    ];

router.get('/system', ...adminOnly(getSystemSettings));
router.put('/system', ...adminOnly(updateSystemSettings));
router.get('/branding', ...adminOnly(getBrandingSettings));
router.put('/branding', ...adminOnly(updateBrandingSettings));

export default router;
