import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().optional().default(''),
  JWT_SECRET: z.string().default('creatorai_dev_secret_key_987654321_secure'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().optional().default(''),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
  IS_PRODUCTION: parsed.data.NODE_ENV === 'production',
};
