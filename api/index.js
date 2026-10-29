// Vercel Serverless Function Entry Point
// Routes incoming requests to the Express application and manages database connectivity

let appInstance = null;
let dbConnect = null;
let dataStoreInstance = null;

function loadModules() {
  if (appInstance && typeof appInstance === 'function') return;

  try {
    const appModule = require('../server/dist/app.js');
    appInstance = appModule.default || appModule;

    const dbModule = require('../server/dist/config/db.js');
    dbConnect = dbModule.connectDB;

    const dsModule = require('../server/dist/services/dataStore.js');
    dataStoreInstance = dsModule.dataStore;
  } catch (e1) {
    try {
      const indexModule = require('../server/dist/index.js');
      appInstance = indexModule.default || indexModule;

      const dbModule = require('../server/dist/config/db.js');
      dbConnect = dbModule.connectDB;

      const dsModule = require('../server/dist/services/dataStore.js');
      dataStoreInstance = dsModule.dataStore;
    } catch (e2) {
      console.error('[Vercel Entrypoint Error loading dist]:', e1.message, e2.message);
    }
  }
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
    console.log('[Vercel Serverless] Blood Donation Backend successfully initialized.');
  } catch (err) {
    console.error('[Vercel Serverless] Database sync error:', err.message);
  }
}

module.exports = async (req, res) => {
  loadModules();
  await ensureInitialized();

  if (!appInstance || typeof appInstance !== 'function') {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'সার্ভার ডিস্ট্রিবিউশন সঠিকভাবে লোড হতে পারেনি। অনুগ্রহ করে প্রজেক্ট রি-বিল্ড করুন।',
      error: 'appInstance is not a function',
      type: typeof appInstance
    }));
  }

  return appInstance(req, res);
};
