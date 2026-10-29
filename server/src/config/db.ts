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

export async function connectDB(): Promise<boolean> {
  // If connection already cached on global scope, reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const uri = ENV.MONGO_URI || 'mongodb+srv://donor012027_db_user:FqIyqHxV9thNXl4g@cluster0.zbhuecg.mongodb.net/bangladesh_blood_db?retryWrites=true&w=majority';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disables Mongoose buffering so requests never hang
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000, // Fail fast if unreachable (e.g. IP whitelist)
      connectTimeoutMS: 3000,
    };

    console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('[Database] Successfully connected to MongoDB Atlas database.');
      isConnected = true;
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    isConnected = true;
    return true;
  } catch (error: any) {
    cached.promise = null;
    isConnected = false;
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn('[Database] Running in Fallback In-Memory Datastore mode with full seed data.');
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
