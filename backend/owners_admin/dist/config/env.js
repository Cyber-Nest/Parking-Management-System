"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// src/config/env.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = (key) => {
    const value = process.env[key];
    if (!value)
        throw new Error(`[Config] Missing required env var: ${key}`);
    return value;
};
const optional = (key, fallback) => process.env[key] ?? fallback;
exports.env = {
    port: parseInt(optional('PORT', '5000'), 10),
    nodeEnv: optional('NODE_ENV', 'development'),
    db: {
        host: optional('DB_HOST', 'localhost'),
        port: parseInt(optional('DB_PORT', '3306'), 10),
        name: optional('DB_NAME', 'parksmart'),
        user: optional('DB_USER', 'root'),
        password: required('DB_PASSWORD'),
    },
    jwt: {
        accessSecret: required('JWT_ACCESS_SECRET'),
        refreshSecret: required('JWT_REFRESH_SECRET'),
        accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '6h'),
        refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
    smtp: {
        host: optional('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(optional('SMTP_PORT', '587'), 10),
        secure: optional('SMTP_SECURE', 'false') === 'true',
        user: optional('SMTP_USER', ''),
        pass: optional('SMTP_PASS', ''),
        from: optional('EMAIL_FROM', 'ParkSmart <no-reply@parksmart.com>'),
    },
    frontendUrl: optional('FRONTEND_URL', 'http://localhost:3000'),
    bcryptSaltRounds: parseInt(optional('BCRYPT_SALT_ROUNDS', '12'), 10),
};
//# sourceMappingURL=env.js.map