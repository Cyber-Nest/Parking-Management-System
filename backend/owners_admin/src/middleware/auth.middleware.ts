// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

export const verifyToken = (
    req: Request,          // ← standard Request
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        (req as AuthenticatedRequest).user = verifyAccessToken(token);  // ← cast here
        next();
    } catch (err) {
        const message =
            err instanceof Error && err.name === 'TokenExpiredError'
                ? 'Token expired'
                : 'Invalid token';
        res.status(401).json({ success: false, message });
    }
};

export const requireAdmin = (
    req: Request,          // ← standard Request
    res: Response,
    next: NextFunction
): void => {
    if ((req as AuthenticatedRequest).user?.userType !== 'admin') {  // ← cast here
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    next();
};

export const requireOfficer = (
    req: Request,          // ← standard Request
    res: Response,
    next: NextFunction
): void => {
    if ((req as AuthenticatedRequest).user?.userType !== 'officer') {  // ← cast here
        res.status(403).json({ success: false, message: 'Officer access required' });
        return;
    }
    next();
};