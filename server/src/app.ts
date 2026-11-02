import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { dataStore } from './services/dataStore.js';

const app = express();

// Trust reverse proxy (Vercel, Nginx, Render) for client IP rate limiting
app.set('trust proxy', 1);

// Auto-initialize MongoDB connection in background without blocking API requests
let isDbInitialized = false;
let isInitializing = false;

async function ensureDbInitialized() {
  if (isDbInitialized || isInitializing) return;
  isInitializing = true;
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      await dataStore.syncWithMongoDB();
      isDbInitialized = true;
    }
  } catch (err: any) {
    console.warn('[Database Init Warning]:', err?.message);
  } finally {
    isInitializing = false;
  }
}

app.use(async (req, res, next) => {
  if (!isDbInitialized && !isInitializing) {
    try {
      await Promise.race([
        ensureDbInitialized(),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
    } catch {}
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
    status: 'online',
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    apiBase: '/api/v1',
    timestamp: new Date().toISOString()
  });
});

// Versioned & Root API Routes (Support /api/v1, /v1, and stripped paths for Vercel services)
app.use('/api/v1', apiRoutes);
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

