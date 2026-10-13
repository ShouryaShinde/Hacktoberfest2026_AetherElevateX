import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:5173',
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 10,
  maxExtractedChars: parseInt(process.env.MAX_EXTRACTED_CHARS, 10) || 100000,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 30,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_database',
};

export default config;
