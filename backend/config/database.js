import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if MongoDB connection is explicitly requested
    const shouldConnectMongoDB = process.env.ENABLE_MONGODB === 'true' || process.env.MONGODB_URI;

    if (!shouldConnectMongoDB) {
      console.log('[INFO] Running in standalone mode (no database)');
      console.log('[TIP] To enable MongoDB: Set ENABLE_MONGODB=true or provide MONGODB_URI');
      global.DATABASE_CONNECTED = false;
      return null;
    }

    // MongoDB connection options optimized for Render (remote Atlas)
    const options = {
      serverSelectionTimeoutMS: 30000, // ↑ 30s for Render→Atlas latency on cold start
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,         // ↑ 30s connect timeout
      maxPoolSize: 5,
      minPoolSize: 1,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      family: 4, // Force IPv4 to avoid IPv6 DNS issues on Render
    };

    // Use only the cloud MongoDB URI — no localhost fallback in production
    const mongoURIs = [
      process.env.MONGODB_URI,
      process.env.MONGO_URI,
    ].filter(Boolean);

    if (mongoURIs.length === 0) {
      console.log('[WARNING] No MONGODB_URI provided. Running in standalone mode.');
      global.DATABASE_CONNECTED = false;
      return null;
    }

    let connected = false;
    let lastError = null;

    for (const uri of mongoURIs) {
      try {
        console.log(`[CONNECTING] Attempting MongoDB connection to: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

        // Wrap in a promise race so unhandled DNS rejections are caught
        const conn = await Promise.race([
          mongoose.connect(uri, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout after 30s')), 30000)
          )
        ]);

        console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
        console.log(`[DATABASE] Database: ${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
          console.error('[ERROR] MongoDB connection error:', err.message);
        });
        mongoose.connection.on('disconnected', () => {
          console.log('[WARNING] MongoDB disconnected');
        });
        mongoose.connection.on('reconnected', () => {
          console.log('[SUCCESS] MongoDB reconnected');
        });

        connected = true;
        break;
      } catch (error) {
        lastError = error;
        console.log(`[FAILED] Could not connect: ${error.message}`);
        // Disconnect any partial connection before retrying
        try { await mongoose.disconnect(); } catch (_) {}
        continue;
      }
    }

    if (!connected) {
      console.log('[WARNING] MongoDB connection failed. Running in standalone mode.');
      console.log('[NOTE] User authentication and data persistence will be disabled.');
      console.log('[FIX] To fix: Install MongoDB or provide a valid MONGODB_URI');

      // Set a flag to indicate no database
      global.DATABASE_CONNECTED = false;
      return null;
    }

    global.DATABASE_CONNECTED = true;
    return mongoose.connection;

  } catch (error) {
    console.error('[ERROR] Database connection error:', error.message);
    console.log('[WARNING] Continuing without database connection...');
    global.DATABASE_CONNECTED = false;
    return null;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('[SHUTDOWN] MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default connectDB;
