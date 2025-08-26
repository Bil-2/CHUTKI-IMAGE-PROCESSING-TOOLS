import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not Google user
    }
  },

  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  avatar: {
    type: String, // URL to profile picture
    default: null
  },

  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Authentication provider
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // User preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    }
  },

  // Usage tracking
  toolsUsed: [{
    toolName: String,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving (only for local users)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false; // Google users don't have passwords
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's display name
userSchema.methods.getDisplayName = function () {
  return this.name || this.email.split('@')[0];
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Add tool usage
userSchema.methods.addToolUsage = function (toolName) {
  this.toolsUsed.push({
    toolName,
    usedAt: new Date()
  });

  // Keep only last 100 tool usages
  if (this.toolsUsed.length > 100) {
    this.toolsUsed = this.toolsUsed.slice(-100);
  }

  return this.save();
};

// Static method to find or create Google user
userSchema.statics.findOrCreateGoogleUser = async function (profile) {
  try {
    // Try to find existing user by Google ID
    let user = await this.findOne({ googleId: profile.id });

    if (user) {
      // Update user info and last login
      user.name = profile.displayName || user.name;
      user.avatar = profile.photos?.[0]?.value || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      return user;
    }

    // Try to find existing user by email
    user = await this.findOne({ email: profile.emails?.[0]?.value });

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.provider = 'google';
      user.avatar = profile.photos?.[0]?.value || user.avatar;
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
      return user;
    }

    // Create new Google user
    user = new this({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
      provider: 'google',
      isVerified: true,
      lastLogin: new Date()
    });

    await user.save();
    return user;

  } catch (error) {
    throw new Error(`Failed to find or create Google user: ${error.message}`);
  }
};

// Transform output (remove sensitive data)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
