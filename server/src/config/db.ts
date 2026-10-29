import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = ENV.MONGO_URI || 'mongodb://127.0.0.1:27017/bangladesh_blood_db';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
    
    // 3 second connection timeout to prevent hanging if no mongo instance is running locally
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    isConnected = true;
    console.log('[Database] Successfully connected to MongoDB database.');
    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn('[Database] Running in Fallback In-Memory Datastore mode with full seed data for local development/testing.');
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

