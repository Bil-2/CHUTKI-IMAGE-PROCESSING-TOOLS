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

    // MongoDB connection options optimized for fast cold starts
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // Timeout after 3s for faster cold start
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 3000, // Connection timeout 3s
      maxPoolSize: 5, // Smaller pool for faster startup
      minPoolSize: 1, // Keep at least 1 connection alive
      heartbeatFrequencyMS: 10000, // Every 10 seconds
      retryWrites: true,
      retryReads: true,
    };

    // Try different MongoDB connection strings
    const mongoURIs = [
      process.env.MONGO_URI,
      process.env.MONGODB_URI,
      'mongodb://127.0.0.1:27017/chutki',
      'mongodb://localhost:27017/chutki'
    ].filter(Boolean);

    let connected = false;
    let lastError = null;

    for (const uri of mongoURIs) {
      try {
        console.log(`[CONNECTING] Attempting MongoDB connection to: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

        const conn = await mongoose.connect(uri, options);

        console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
        console.log(`[DATABASE] Database: ${conn.connection.name}`);

        // Set up connection event listeners
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
        console.log(`[FAILED] Failed to connect to ${uri}: ${error.message}`);
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
