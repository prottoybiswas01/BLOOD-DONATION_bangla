import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function bootstrap() {
  await connectDB();

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

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

