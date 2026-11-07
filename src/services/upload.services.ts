import { createHash } from 'node:crypto';
import { AppError } from '../utils/error.utils';

export function createUploadSignature(): {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
} {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(500, 'Cloudinary configuration is missing');
  }

  const folder = 'adnwebs';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  };
}

// Extrae public_id y resource_type de una URL de entrega de Cloudinary.
// Solo acepta URLs del cloud configurado; cualquier otra devuelve null.
export function parseCloudinaryAsset(
  url: string | null | undefined,
): { publicId: string; resourceType: 'image' | 'video' | 'raw' } | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!url || !cloudName) return null;

  const match = url.match(
    /^https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)$/,
  );
  if (!match || match[1] !== cloudName) return null;

  const [, , resourceType, path] = match;
  // Image/video quitan la extensión; raw la conserva en el public_id.
  const publicId =
    resourceType === 'raw' ? path : path.replace(/\.[^./]+$/, '');
  return { publicId, resourceType: resourceType as 'image' | 'video' | 'raw' };
}

// Borra un asset en Cloudinary. Firma public_id y timestamp con api_secret.
export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw',
): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(500, 'Cloudinary configuration is missing');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const body = new FormData();
  body.append('public_id', publicId);
  body.append('timestamp', String(timestamp));
  body.append('api_key', apiKey);
  body.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    { method: 'POST', body },
  );
  if (!response.ok) {
    throw new AppError(502, `Cloudinary destroy failed: ${response.status}`);
  }
}
