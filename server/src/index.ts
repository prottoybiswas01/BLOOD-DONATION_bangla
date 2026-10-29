import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { dataStore } from './services/dataStore.js';

async function bootstrap() {
  const isConnected = await connectDB();
  if (isConnected) {
    await dataStore.syncWithMongoDB();
  }

  const port = parseInt(ENV.PORT, 10);
  app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🩸 বাংলাদেশ রক্তদান প্ল্যাটফর্ম API (Backend Server)`);
    console.log(`🚀 সার্ভার চালু রয়েছে: http://localhost:${port}`);
    console.log(`📡 API বেস পাথ: http://localhost:${port}/api/v1`);
    console.log(`🔒 এনভায়রনমেন্ট: ${ENV.NODE_ENV}`);
    console.log(`📱 SMS প্রোভাইডার: ${ENV.SMS_PROVIDER}`);
    console.log(`======================================================\n`);
  });
}

// Start listening only in standalone server mode, not when loaded as a Vercel serverless function
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.VERCEL_ENV
);

if (process.env.NODE_ENV !== 'test' && !isServerless) {
  bootstrap().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;

// Ensure CommonJS compatibility for Vercel Express runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

