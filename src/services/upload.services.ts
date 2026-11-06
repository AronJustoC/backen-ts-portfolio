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
