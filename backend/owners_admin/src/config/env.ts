// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
// import path from 'path';

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`[Config] Missing required env var: ${key}`);
  return value;
};
const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  port: parseInt(optional("PORT", "5000"), 10),
  nodeEnv: optional("NODE_ENV", "development"),

  db: {
    host: optional("DB_HOST", "localhost"),
    port: parseInt(optional("DB_PORT", "3306"), 10),
    name: optional("DB_NAME", "parksmart"),
    user: optional("DB_USER", "root"),
    password: required("DB_PASSWORD"),
  },

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresIn: optional("JWT_ACCESS_EXPIRES_IN", "6h"),
    refreshExpiresIn: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  smtp: {
    host: optional("SMTP_HOST", "smtp.gmail.com"),
    port: parseInt(optional("SMTP_PORT", "587"), 10),
    secure: optional("SMTP_SECURE", "false") === "true",
    user: optional("SMTP_USER", ""),
    pass: optional("SMTP_PASS", ""),
    from: optional("EMAIL_FROM", "ParkSmart <no-reply@parksmart.com>"),
  },

  stripe: {
    secretKey: optional("STRIPE_SECRET_KEY", ""),
    publishableKey: optional("STRIPE_PUBLISHABLE_KEY", ""),
  },

  frontendUrl: optional("FRONTEND_URL", "http://localhost:3000"),

  cloudinary: {
    url: optional("CLOUDINARY_URL", ""),
    cloudName: optional("CLOUDINARY_CLOUD_NAME", ""),
    apiKey: optional("CLOUDINARY_API_KEY", ""),
    apiSecret: optional("CLOUDINARY_API_SECRET", ""),
    defaultFolder: optional("CLOUDINARY_FOLDER", "parksmart"),
  },

  bcryptSaltRounds: (() => {
    const n = parseInt(optional("BCRYPT_SALT_ROUNDS", "12"), 10);
    return Number.isFinite(n) && n >= 4 ? Math.min(15, n) : 12;
  })(),
} as const;
