import mongoose from 'mongoose';
import { ENV } from './env.js';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let isConnected = false;

export async function connectDB(retries = 2): Promise<boolean> {
  // If connection already cached on global scope and active
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    isConnected = true;
    cached.conn = mongoose;
    return true;
  }

  const uri = ENV.MONGO_URI;

  if (!uri) {
    if (ENV.NODE_ENV === 'production') {
      console.error('[Security Critical] MONGO_URI is missing from environment variables in production!');
    } else {
      console.warn('[Database] No MONGO_URI configured in environment variables.');
    }
    isConnected = false;
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    if (!cached.promise || (mongoose.connection && mongoose.connection.readyState === 0)) {
      const opts: mongoose.ConnectOptions = {
        bufferCommands: false, // Disables Mongoose buffering so requests never hang
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000, // Adequate window for serverless cold-starts & cloud DNS
        connectTimeoutMS: 10000,
      };

      console.log(`[Database] Attempting connection to MongoDB (attempt ${attempt}/${retries}) at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);

      cached.promise = mongoose.connect(uri, opts).then((m) => {
        console.log('[Database] Successfully connected to MongoDB Atlas database.');
        isConnected = true;
        return m;
      });
    }

    try {
      cached.conn = await cached.promise;
      isConnected = mongoose.connection.readyState === 1;
      if (isConnected) return true;
    } catch (error: any) {
      cached.promise = null;
      cached.conn = null;
      isConnected = false;
      console.warn(`[Database Warning] Could not connect to MongoDB (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  return isConnected;
}

export function isDatabaseConnected(): boolean {
  return Boolean(mongoose.connection && mongoose.connection.readyState === 1);
}
