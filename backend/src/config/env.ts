import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  HF_TOKEN: process.env.HF_TOKEN || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  HF_MAX_RETRIES: parseInt(process.env.HF_MAX_RETRIES || '3', 10),
  CATVTON_TIMEOUT_MS: parseInt(process.env.CATVTON_TIMEOUT_MS || '180000', 10),
};
