// src/middleware/errorHandler.middleware.ts
// Global Express error handler

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('[GlobalErrorHandler]', err.stack ?? err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

// src/middleware/errorHandler.middleware.ts

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
};