import crypto from 'crypto';

export const generateUUID = (): string => crypto.randomUUID();
