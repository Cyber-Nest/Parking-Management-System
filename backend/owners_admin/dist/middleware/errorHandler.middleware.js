"use strict";
// src/middleware/errorHandler.middleware.ts
// Global Express error handler
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error('[GlobalErrorHandler]', err.stack ?? err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
// src/middleware/errorHandler.middleware.ts
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.middleware.js.map