// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // creates an index automatically
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // required only if not a Google OAuth user
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password in queries by default
    },
    googleId: {
      type: String,
      unique: true, // creates an index automatically
      sparse: true, // allows null values
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for user's full profile URL
userSchema.virtual("profileUrl").get(function() {
  return `/api/users/${this._id}`;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  return userObject;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find user by email or googleId
userSchema.statics.findByEmailOrGoogleId = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { googleId: identifier }
    ]
  });
};

// Static method to create or update Google user
userSchema.statics.findOrCreateGoogleUser = async function(profile) {
  let user = await this.findOne({ googleId: profile.id });
  
  if (!user) {
    // Check if user exists with same email
    user = await this.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
    } else {
      // Create new user
      user = new this({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value,
      });
      await user.save();
    }
  } else {
    // Update existing Google user
    user.name = profile.displayName;
    user.avatar = profile.photos[0]?.value || user.avatar;
    await user.save();
  }
  
  return user;
};

// Avoid OverwriteModelError with nodemon
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
