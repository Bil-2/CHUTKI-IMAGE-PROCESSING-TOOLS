#!/usr/bin/env node
// setup-auth.js - Production Authentication Setup Script

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// User Schema (simplified for setup)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  provider: { type: String, default: 'local' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

async function setupAuthentication() {
  try {
    console.log('[SETUP] Setting up CHUTKI Authentication System...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chutki';
    console.log(`📡 Connecting to MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected successfully\n');

    // Create test users
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@chutki.com',
        password: 'admin123'
      },
      {
        name: 'Test User',
        email: 'user@chutki.com',
        password: 'user123'
      },
      {
        name: 'Demo User',
        email: 'demo@chutki.com',
        password: 'demo123'
      }
    ];

    console.log('👥 Creating test users...');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists - skipping`);
          continue;
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        console.log(`✅ Created user: ${userData.email} (password: ${userData.password})`);
      } catch (error) {
        console.log(`❌ Failed to create user ${userData.email}: ${error.message}`);
      }
    }

    console.log('\n🎉 Authentication setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: admin@chutki.com | Password: admin123');
    console.log('   Email: user@chutki.com  | Password: user123');
    console.log('   Email: demo@chutki.com  | Password: demo123');
    console.log('\n[URL] Login URL: http://localhost:5173/login');
    console.log('[URL] Register URL: http://localhost:5173/register');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB Connection Failed!');
      console.log('   Please ensure MongoDB is installed and running:');
      console.log('   • Install: brew install mongodb/brew/mongodb-community');
      console.log('   • Start: brew services start mongodb/brew/mongodb-community');
      console.log('   • Or use MongoDB Atlas cloud database');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run setup
setupAuthentication();
