import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { getReport } from '../controllers/reports.controller';

const router = Router();

const adminOnly = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
        verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
        requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
        handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
    ];

router.get('/:type', ...adminOnly(getReport));

export default router;
