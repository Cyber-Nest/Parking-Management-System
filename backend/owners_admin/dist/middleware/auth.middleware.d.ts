import { Request, Response, NextFunction } from 'express';
export declare const verifyToken: (req: Request, // ← standard Request
res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, // ← standard Request
res: Response, next: NextFunction) => void;
export declare const requireOfficer: (req: Request, // ← standard Request
res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map