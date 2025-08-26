import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB connection options for production
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      heartbeatFrequencyMS: 10000, // Every 10 seconds
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
        console.log(`🔄 Attempting MongoDB connection to: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

        const conn = await mongoose.connect(uri, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Set up connection event listeners
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
          console.log('✅ MongoDB reconnected');
        });

        connected = true;
        break;
      } catch (error) {
        lastError = error;
        console.log(`❌ Failed to connect to ${uri}: ${error.message}`);
        continue;
      }
    }

    if (!connected) {
      console.log('⚠️  MongoDB connection failed. Running in standalone mode.');
      console.log('📝 Note: User authentication and data persistence will be disabled.');
      console.log('🔧 To fix: Install MongoDB or provide a valid MONGODB_URI');

      // Set a flag to indicate no database
      global.DATABASE_CONNECTED = false;
      return null;
    }

    global.DATABASE_CONNECTED = true;
    return mongoose.connection;

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Continuing without database connection...');
    global.DATABASE_CONNECTED = false;
    return null;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default connectDB;
