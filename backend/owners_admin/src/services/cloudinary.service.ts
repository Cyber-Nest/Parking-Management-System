import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { ValidationError } from './commonErrors';

let configured = false;

const PLACEHOLDER_CLOUD_NAMES = new Set([
  'your_cloud_name',
  'your_actual_cloud_name',
  'your-cloud-name',
  'YOUR_CLOUD_NAME',
  'REPLACE_ME',
  'changeme',
]);

export function isValidCloudName(cloudName: string | undefined): boolean {
  const name = cloudName?.trim();
  if (!name) return false;
  if (PLACEHOLDER_CLOUD_NAMES.has(name)) return false;
  if (/your[_\s-]*cloud/i.test(name)) return false;
  return true;
}

function parseCloudinaryUrl(url: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
  const match = url.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/i);
  if (!match) return null;
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

export function getCloudinaryConfig() {
  const fromUrl = env.cloudinary.url ? parseCloudinaryUrl(env.cloudinary.url) : null;
  return {
    cloudName: fromUrl?.cloudName ?? env.cloudinary.cloudName,
    apiKey: fromUrl?.apiKey ?? env.cloudinary.apiKey,
    apiSecret: fromUrl?.apiSecret ?? env.cloudinary.apiSecret,
  };
}

export function isCloudinaryConfigured(): boolean {
  const cfg = getCloudinaryConfig();
  return Boolean(isValidCloudName(cfg.cloudName) && cfg.apiKey && cfg.apiSecret);
}

export function getCloudinarySetupError(): string | null {
  const cfg = getCloudinaryConfig();
  if (!cfg.apiKey || !cfg.apiSecret) {
    return 'Set CLOUDINARY_URL or CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env';
  }
  if (!isValidCloudName(cfg.cloudName)) {
    return 'Set CLOUDINARY_CLOUD_NAME in backend/.env to your Cloudinary cloud name (Dashboard → Product Environment), or use CLOUDINARY_URL=cloudinary://KEY:SECRET@cloud_name';
  }
  return null;
}

function ensureConfigured(): void {
  if (configured) return;

  if (env.cloudinary.url?.trim()) {
    cloudinary.config({ secure: true });
    configured = true;
    return;
  }

  const setupError = getCloudinarySetupError();
  if (setupError) {
    throw new ValidationError(setupError);
  }

  const cfg = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });
  configured = true;
}

export function isCloudinaryUrl(url: string): boolean {
  return /res\.cloudinary\.com/i.test(url.trim());
}

function isDataUrl(value: string): boolean {
  return /^data:(image|video)\/[a-z0-9.+-]+;base64,/i.test(value.trim());
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export async function uploadMedia(
  source: string,
  options?: { folder?: string; resourceType?: 'image' | 'video' | 'auto' },
): Promise<string> {
  const trimmed = source?.trim();
  if (!trimmed) throw new ValidationError('Media source is required');

  if (isCloudinaryUrl(trimmed)) return trimmed;

  ensureConfigured();

  const folder = options?.folder ?? env.cloudinary.defaultFolder;
  const resourceType = options?.resourceType ?? 'auto';

  if (trimmed.startsWith('blob:')) {
    throw new ValidationError('Upload the file to the server first (blob URLs cannot be stored)');
  }

  if (!isDataUrl(trimmed) && !isHttpUrl(trimmed)) {
    throw new ValidationError('Media must be a base64 data URL or http(s) URL');
  }

  if (trimmed.length > 12_000_000) {
    throw new ValidationError('Media file is too large');
  }

  try {
    const result = await cloudinary.uploader.upload(trimmed, {
      folder,
      resource_type: resourceType,
      public_id: `${folder.replace(/[/.]/g, '_')}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    });
    return result.secure_url;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cloudinary upload failed';
    throw new ValidationError(message);
  }
}

export async function uploadMediaList(
  sources: string[],
  options?: { folder?: string; resourceType?: 'image' | 'video' | 'auto' },
): Promise<string[]> {
  const uploaded: string[] = [];
  for (const source of sources) {
    if (!source?.trim()) continue;
    uploaded.push(await uploadMedia(source, options));
  }
  return uploaded;
}

/** Upload to Cloudinary when needed; pass through existing Cloudinary URLs. */
export async function ensureCloudinaryUrl(
  source: string,
  options?: { folder?: string; resourceType?: 'image' | 'video' | 'auto' },
): Promise<string> {
  const trimmed = source?.trim();
  if (!trimmed) throw new ValidationError('Media source is required');
  if (isCloudinaryUrl(trimmed)) return trimmed;
  return uploadMedia(trimmed, options);
}
