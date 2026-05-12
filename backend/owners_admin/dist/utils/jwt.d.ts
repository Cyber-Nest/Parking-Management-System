import { JwtPayload } from '../types';
export declare const signAccessToken: (payload: Omit<JwtPayload, "iat" | "exp">) => string;
export declare const signRefreshToken: (payload: Omit<JwtPayload, "iat" | "exp">) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
//# sourceMappingURL=jwt.d.ts.map