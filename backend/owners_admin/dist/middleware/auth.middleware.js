"use strict";
// src/middleware/auth.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOfficer = exports.requireAdmin = exports.verifyToken = void 0;
const jwt_1 = require("../utils/jwt");
const verifyToken = (req, // ← standard Request
res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = (0, jwt_1.verifyAccessToken)(token); // ← cast here
        next();
    }
    catch (err) {
        const message = err instanceof Error && err.name === 'TokenExpiredError'
            ? 'Token expired'
            : 'Invalid token';
        res.status(401).json({ success: false, message });
    }
};
exports.verifyToken = verifyToken;
const requireAdmin = (req, // ← standard Request
res, next) => {
    if (req.user?.userType !== 'admin') { // ← cast here
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireOfficer = (req, // ← standard Request
res, next) => {
    if (req.user?.userType !== 'officer') { // ← cast here
        res.status(403).json({ success: false, message: 'Officer access required' });
        return;
    }
    next();
};
exports.requireOfficer = requireOfficer;
//# sourceMappingURL=auth.middleware.js.map