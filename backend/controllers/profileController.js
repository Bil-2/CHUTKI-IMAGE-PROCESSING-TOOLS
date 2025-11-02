import User from '../models/User.js';

/**
 * Get user profile with full details
 * @route GET /api/profile
 */
export const getFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get usage statistics
    const stats = user.getUsageStats(30);

    res.status(200).json({
      success: true,
      user,
      statistics: stats
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      phone,
      location,
      website,
      company,
      jobTitle,
      socialLinks
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic info
    if (name) user.name = name;

    // Update profile details
    if (bio !== undefined) user.profile.bio = bio;
    if (phone !== undefined) user.profile.phone = phone;
    if (location) user.profile.location = location;
    if (website !== undefined) user.profile.website = website;
    if (company !== undefined) user.profile.company = company;
    if (jobTitle !== undefined) user.profile.jobTitle = jobTitle;
    if (socialLinks) user.profile.socialLinks = { ...user.profile.socialLinks, ...socialLinks };

    await user.save();

    // Log activity
    await user.addActivity('profile_updated', 'User updated their profile', {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Update user preferences
 * @route PUT /api/profile/preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    const allowedPreferences = [
      'theme',
      'language',
      'defaultImageQuality',
      'autoSaveSettings',
      'emailNotifications',
      'marketingEmails',
      'defaultOutputFormat',
      'compressionLevel'
    ];

    allowedPreferences.forEach(pref => {
      if (req.body[pref] !== undefined) {
        user.preferences[pref] = req.body[pref];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * @route GET /api/profile/statistics
 */
export const getUserStatistics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = user.getUsageStats(days);

    res.status(200).json({
      success: true,
      statistics: {
        ...stats,
        totalToolsUsed: user.statistics.totalToolsUsed,
        totalImagesProcessed: user.statistics.totalImagesProcessed,
        favoriteTools: user.statistics.favoriteTools,
        lastToolUsed: user.statistics.lastToolUsed,
        averageProcessingTime: user.statistics.averageProcessingTime,
        memberSince: user.createdAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Get activity log
 * @route GET /api/profile/activity
 */
export const getActivityLog = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const user = await User.findById(req.user.id).select('activityLog');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activities = user.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log',
      error: error.message
    });
  }
};

/**
 * Save preset
 * @route POST /api/profile/presets
 */
export const saveUserPreset = async (req, res) => {
  try {
    const { name, toolName, settings } = req.body;

    if (!name || !toolName || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Name, toolName, and settings are required'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.savePreset(name, toolName, settings);

    res.status(200).json({
      success: true,
      message: 'Preset saved successfully',
      presets: user.savedPresets
    });
  } catch (error) {
    console.error('Save preset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preset',
      error: error.message
    });
  }
};

/**
 * Get user presets
 * @route GET /api/profile/presets
 */
export const getUserPresets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedPresets');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      presets: user.savedPresets
    });
  } catch (error) {
    console.error('Get presets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch presets',
      error: error.message
    });
  }
};

/**
 * Delete preset
 * @route DELETE /api/profile/presets/:presetId
 */
export const deleteUserPreset = async (req, res) => {
  try {
    const { presetId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deletePreset(presetId);

    res.status(200).json({
      success: true,
      message: 'Preset deleted successfully',
      presets: user.savedPresets
    });
  } catch (error) {
    console.error('Delete preset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete preset',
      error: error.message
    });
  }
};

/**
 * Upload profile avatar
 * @route POST /api/profile/avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // In a real application, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just store the filename
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

/**
 * Delete account
 * @route DELETE /api/profile
 */
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password for local users
    if (user.provider === 'local') {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};
