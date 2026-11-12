import { createHash } from 'node:crypto';
import type { UploadSignature } from '@portfolio/shared';
import { env } from './env';
import { notConfigured } from './errors';
import { logger } from './logger';

type Config = { cloudName: string; apiKey: string; apiSecret: string };

function config(): Config {
  const {
    CLOUDINARY_CLOUD_NAME: cloudName,
    CLOUDINARY_API_KEY: apiKey,
    CLOUDINARY_API_SECRET: apiSecret,
  } = env;
  if (!cloudName || !apiKey || !apiSecret) throw notConfigured('Cloudinary');
  return { cloudName, apiKey, apiSecret };
}

/** Cloudinary request signature: SHA-1 of the sorted `key=value` params followed by the API secret. */
export function signParams(params: Record<string, string>, apiSecret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1')
    .update(payload + apiSecret)
    .digest('hex');
}

const uploadRules = {
  image: { folder: 'projects', formats: 'jpg,jpeg,png,webp,avif' },
  cv: { folder: 'cv', formats: 'pdf' },
} as const;

export const folderFor = (kind: keyof typeof uploadRules) =>
  `${env.CLOUDINARY_FOLDER}/${uploadRules[kind].folder}`;

/** Short-lived signature the admin's browser uses to upload straight to Cloudinary. */
export function createUploadSignature(kind: keyof typeof uploadRules, now = Date.now()): UploadSignature {
  const { cloudName, apiKey, apiSecret } = config();
  const params = {
    folder: folderFor(kind),
    allowed_formats: uploadRules[kind].formats,
    timestamp: String(Math.floor(now / 1000)),
  };
  return {
    // PDFs are uploaded as the "image" resource type so Cloudinary can serve them with a download flag.
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: { ...params, api_key: apiKey, signature: signParams(params, apiSecret) },
  };
}

/** Only URLs from our own Cloudinary account and folder are accepted (no open redirects). */
export function isOwnAsset(url: string, publicId: string, kind: keyof typeof uploadRules): boolean {
  const { cloudName } = config();
  return (
    url.startsWith(`https://res.cloudinary.com/${cloudName}/`) && publicId.startsWith(`${folderFor(kind)}/`)
  );
}

/** Delivery URL that makes the browser download the file under a friendly name. */
export function attachmentUrl(url: string, fileName: string): string {
  const safe = fileName.replace(/\.[a-z0-9]+$/i, '').replace(/[^A-Za-z0-9_-]+/g, '_');
  return url.replace('/upload/', `/upload/fl_attachment:${safe}/`);
}

/** Best-effort delete of a replaced or removed asset; failures are logged, never thrown. */
export async function destroyAsset(publicId: string): Promise<void> {
  try {
    const { cloudName, apiKey, apiSecret } = config();
    const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
    const body = new URLSearchParams({
      ...params,
      api_key: apiKey,
      signature: signParams(params, apiSecret),
    });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body,
    });
    if (!res.ok) logger.warn({ publicId, status: res.status }, 'cloudinary destroy failed');
  } catch (err) {
    logger.warn({ err, publicId }, 'cloudinary destroy failed');
  }
}
