import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  // If already connected, reuse existing connection (vital for serverless function caching)
  if ((mongoose.connection.readyState as number) === 1) {
    isConnected = true;
    return true;
  }

  // If connection is in progress, await it
  if ((mongoose.connection.readyState as number) === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
      setTimeout(resolve, 5000);
    });
    if ((mongoose.connection.readyState as number) === 1) {
      isConnected = true;
      return true;
    }
  }

  const uri = ENV.MONGO_URI || 'mongodb+srv://donor012027_db_user:FqIyqHxV9thNXl4g@cluster0.zbhuecg.mongodb.net/bangladesh_blood_db?retryWrites=true&w=majority';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
    
    // 10 second connection timeout for reliable cloud database connections
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
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

