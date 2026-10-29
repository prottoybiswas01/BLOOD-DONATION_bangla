import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { ENV } from './config/env.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General Rate Limiting
app.use('/api', generalRateLimiter);

// Versioned API Routes
app.use('/api/v1', apiRoutes);

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

