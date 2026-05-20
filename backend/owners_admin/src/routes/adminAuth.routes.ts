// src/routes/adminAuth.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import {
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    getMe,
} from '../controllers/adminAuth.controller';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ─── Typed wrapper so protected handlers compile cleanly ──────
type AuthHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
const protect = (handler: AuthHandler) => {
    if (typeof verifyToken !== 'function') throw new Error('verifyToken is not a function — check auth.middleware export');
    if (typeof requireAdmin !== 'function') throw new Error('requireAdmin is not a function — check auth.middleware export');
    if (typeof handler !== 'function') throw new Error('protect() received a non-function handler');

    return [
        verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
        requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
        handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
    ];
};

// ─── Public ───────────────────────────────────────────────────
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Protected (requires valid JWT + admin role) ──────────────
router.post('/logout', ...protect(logout));
router.get('/me', ...protect(getMe));

export default router;