import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://donor012027_db_user:FqIyqHxV9thNXl4g@cluster0.zbhuecg.mongodb.net/bangladesh_blood_db?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_bangladesh_blood_platform_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock', // 'mock' | 'bulksmsbd' | 'greenweb' | 'twilio'
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  DAILY_CONTACT_LIMIT: parseInt(process.env.DAILY_CONTACT_LIMIT || '5', 10),
};

