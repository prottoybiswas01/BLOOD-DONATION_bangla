import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { ENV } from './config/env.js';
import { connectDB, isDatabaseConnected } from './config/db.js';
import { dataStore } from './services/dataStore.js';

const app = express();

// Trust reverse proxy (Vercel, Nginx, Render) for client IP rate limiting
app.set('trust proxy', 1);

// Auto-initialize MongoDB connection in serverless environment
async function ensureDbInitialized(): Promise<boolean> {
  if (isDatabaseConnected()) return true;
  if (!ENV.MONGO_URI) return false;
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      await dataStore.syncWithMongoDB();
      return true;
    }
    return false;
  } catch (err: any) {
    console.warn('[Database Init Warning]:', err?.message);
    return false;
  }
}

app.use(async (req, res, next) => {
  // Static and root diagnostics can proceed immediately
  if (req.path === '/' || req.path === '/health' || req.path === '/favicon.ico') {
    return next();
  }

  if (ENV.MONGO_URI && !isDatabaseConnected()) {
    await ensureDbInitialized();
  }

  // Production write guard: prevent phantom in-memory writes when DB is disconnected
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
  const isProdMode = ENV.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(ENV.MONGO_URI);
  if (isMutation && isProdMode && !isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message: 'ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
    });
  }

  next();
});

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Native mobile apps and non-browser clients do not send Origin header
    if (!origin) {
      return callback(null, true);
    }
    if (ENV.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const allowed = [
      ENV.CLIENT_URL,
      ...ENV.ALLOWED_ORIGINS,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://blood-donationbangla.vercel.app'
    ].filter(Boolean);

    const isVercel = origin.endsWith('.vercel.app');
    if (allowed.includes(origin) || isVercel) {
      return callback(null, true);
    }
    return callback(new Error('CORS request blocked by security policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-platform', 'x-app-version']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General Rate Limiting
app.use('/api', generalRateLimiter);

// Health and Status Check
app.get(['/', '/api', '/api/v1'], (req, res) => {
  res.json({
    success: true,
    platform: 'বাংলাদেশ রক্তদান প্ল্যাটফর্ম (Bangladesh Blood Donation Platform)',
    status: isDatabaseConnected() ? 'online' : (ENV.NODE_ENV === 'production' ? 'degraded' : 'in-memory'),
    databaseConnected: isDatabaseConnected(),
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    apiBase: '/api/v1',
    timestamp: new Date().toISOString()
  });
});

// Versioned & Root API Routes (Support /api/v1, /v1, and stripped paths for Vercel services)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);
app.use('/v1', apiRoutes);
app.use('/', apiRoutes);

// Fallback for missing routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `অনুরোধকৃত পথটি (${req.originalUrl}) সার্ভারে পাওয়া যায়নি।`
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}
