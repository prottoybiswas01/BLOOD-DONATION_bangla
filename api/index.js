// Vercel Serverless Function Entry Point
// Routes incoming requests to the Express application and manages database connectivity

const path = require('path');

// Safe imports of compiled server dist
let appInstance = null;
let dbConnect = null;
let dataStoreInstance = null;

try {
  const appModule = require('../server/dist/app.js');
  appInstance = appModule.default || appModule;

  const dbModule = require('../server/dist/config/db.js');
  dbConnect = dbModule.connectDB;

  const dsModule = require('../server/dist/services/dataStore.js');
  dataStoreInstance = dsModule.dataStore;
} catch (e) {
  console.error('[Vercel Entrypoint] Error loading server modules:', e);
}

let isInitialized = false;

async function ensureInitialized() {
  if (isInitialized) return;

  try {
    if (dbConnect) {
      const isConnected = await dbConnect();
      if (isConnected && dataStoreInstance) {
        await dataStoreInstance.syncWithMongoDB();
      }
    }
    isInitialized = true;
    console.log('[Vercel Serverless] Blood Donation Backend successfully initialized with MongoDB Atlas.');
  } catch (err) {
    console.error('[Vercel Serverless] Database sync error:', err);
  }
}

module.exports = async (req, res) => {
  await ensureInitialized();

  if (!appInstance) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      success: false,
      message: 'Server distribution not built. Please run npm run build.'
    }));
  }

  return appInstance(req, res);
};

