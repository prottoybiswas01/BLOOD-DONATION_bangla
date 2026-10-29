import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { ENV } from './config/env.js';

const app = express();

// Trust reverse proxy (Vercel, Nginx, Render) for client IP rate limiting
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins (localhost, Vercel deployments, custom domains)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General Rate Limiting
app.use('/api', generalRateLimiter);

// Versioned API Routes (Support both /api/v1 and /v1 for Vercel serverless rewrites)
app.use('/api/v1', apiRoutes);
app.use('/v1', apiRoutes);

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

