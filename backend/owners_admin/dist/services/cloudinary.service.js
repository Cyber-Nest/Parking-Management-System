"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCloudName = isValidCloudName;
exports.getCloudinaryConfig = getCloudinaryConfig;
exports.isCloudinaryConfigured = isCloudinaryConfigured;
exports.getCloudinarySetupError = getCloudinarySetupError;
exports.isCloudinaryUrl = isCloudinaryUrl;
exports.uploadMedia = uploadMedia;
exports.uploadMediaList = uploadMediaList;
exports.ensureCloudinaryUrl = ensureCloudinaryUrl;
const crypto_1 = __importDefault(require("crypto"));
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
const commonErrors_1 = require("./commonErrors");
let configured = false;
const PLACEHOLDER_CLOUD_NAMES = new Set([
    'your_cloud_name',
    'your_actual_cloud_name',
    'your-cloud-name',
    'YOUR_CLOUD_NAME',
    'REPLACE_ME',
    'changeme',
]);
function isValidCloudName(cloudName) {
    const name = cloudName?.trim();
    if (!name)
        return false;
    if (PLACEHOLDER_CLOUD_NAMES.has(name))
        return false;
    if (/your[_\s-]*cloud/i.test(name))
        return false;
    return true;
}
function parseCloudinaryUrl(url) {
    const match = url.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/i);
    if (!match)
        return null;
    return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}
function getCloudinaryConfig() {
    const fromUrl = env_1.env.cloudinary.url ? parseCloudinaryUrl(env_1.env.cloudinary.url) : null;
    return {
        cloudName: fromUrl?.cloudName ?? env_1.env.cloudinary.cloudName,
        apiKey: fromUrl?.apiKey ?? env_1.env.cloudinary.apiKey,
        apiSecret: fromUrl?.apiSecret ?? env_1.env.cloudinary.apiSecret,
    };
}
function isCloudinaryConfigured() {
    const cfg = getCloudinaryConfig();
    return Boolean(isValidCloudName(cfg.cloudName) && cfg.apiKey && cfg.apiSecret);
}
function getCloudinarySetupError() {
    const cfg = getCloudinaryConfig();
    if (!cfg.apiKey || !cfg.apiSecret) {
        return 'Set CLOUDINARY_URL or CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env';
    }
    if (!isValidCloudName(cfg.cloudName)) {
        return 'Set CLOUDINARY_CLOUD_NAME in backend/.env to your Cloudinary cloud name (Dashboard → Product Environment), or use CLOUDINARY_URL=cloudinary://KEY:SECRET@cloud_name';
    }
    return null;
}
function ensureConfigured() {
    if (configured)
        return;
    if (env_1.env.cloudinary.url?.trim()) {
        cloudinary_1.v2.config({ secure: true });
        configured = true;
        return;
    }
    const setupError = getCloudinarySetupError();
    if (setupError) {
        throw new commonErrors_1.ValidationError(setupError);
    }
    const cfg = getCloudinaryConfig();
    cloudinary_1.v2.config({
        cloud_name: cfg.cloudName,
        api_key: cfg.apiKey,
        api_secret: cfg.apiSecret,
        secure: true,
    });
    configured = true;
}
function isCloudinaryUrl(url) {
    return /res\.cloudinary\.com/i.test(url.trim());
}
function isDataUrl(value) {
    return /^data:(image|video)\/[a-z0-9.+-]+;base64,/i.test(value.trim());
}
function isHttpUrl(value) {
    return /^https?:\/\//i.test(value.trim());
}
async function uploadMedia(source, options) {
    const trimmed = source?.trim();
    if (!trimmed)
        throw new commonErrors_1.ValidationError('Media source is required');
    if (isCloudinaryUrl(trimmed))
        return trimmed;
    ensureConfigured();
    const folder = options?.folder ?? env_1.env.cloudinary.defaultFolder;
    const resourceType = options?.resourceType ?? 'auto';
    if (trimmed.startsWith('blob:')) {
        throw new commonErrors_1.ValidationError('Upload the file to the server first (blob URLs cannot be stored)');
    }
    if (!isDataUrl(trimmed) && !isHttpUrl(trimmed)) {
        throw new commonErrors_1.ValidationError('Media must be a base64 data URL or http(s) URL');
    }
    if (trimmed.length > 12000000) {
        throw new commonErrors_1.ValidationError('Media file is too large');
    }
    try {
        const result = await cloudinary_1.v2.uploader.upload(trimmed, {
            folder,
            resource_type: resourceType,
            public_id: `${folder.replace(/[/.]/g, '_')}_${Date.now()}_${crypto_1.default.randomBytes(4).toString('hex')}`,
        });
        return result.secure_url;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cloudinary upload failed';
        throw new commonErrors_1.ValidationError(message);
    }
}
async function uploadMediaList(sources, options) {
    const uploaded = [];
    for (const source of sources) {
        if (!source?.trim())
            continue;
        uploaded.push(await uploadMedia(source, options));
    }
    return uploaded;
}
/** Upload to Cloudinary when needed; pass through existing Cloudinary URLs. */
async function ensureCloudinaryUrl(source, options) {
    const trimmed = source?.trim();
    if (!trimmed)
        throw new commonErrors_1.ValidationError('Media source is required');
    if (isCloudinaryUrl(trimmed))
        return trimmed;
    return uploadMedia(trimmed, options);
}
//# sourceMappingURL=cloudinary.service.js.map