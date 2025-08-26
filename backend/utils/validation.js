// utils/validation.js

import validator from 'validator';

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// File validation
export const isValidImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return file &&
    allowedTypes.includes(file.mimetype) &&
    file.size <= maxSize;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validate object properties
export const validateRequiredFields = (obj, requiredFields) => {
  const missing = [];

  requiredFields.forEach(field => {
    if (!obj[field] || (typeof obj[field] === 'string' && !obj[field].trim())) {
      missing.push(field);
    }
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};

/**
 * Validate input data against rules
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation result
 */
export const validateInput = (data, rules) => {
  const errors = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    // Required field check
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) continue;

    const stringValue = value.toString().trim();

    // Length validations
    if (fieldRules.minLength && stringValue.length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
      isValid = false;
    }

    if (fieldRules.maxLength && stringValue.length > fieldRules.maxLength) {
      errors[field] = `${field} must not exceed ${fieldRules.maxLength} characters`;
      isValid = false;
    }

    // Email validation
    if (fieldRules.email && !validator.isEmail(stringValue)) {
      errors[field] = `${field} must be a valid email address`;
      isValid = false;
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(stringValue)) {
      errors[field] = `${field} format is invalid`;
      isValid = false;
    }

    // Numeric validations
    if (fieldRules.numeric && !validator.isNumeric(stringValue)) {
      errors[field] = `${field} must be a number`;
      isValid = false;
    }

    // URL validation
    if (fieldRules.url && !validator.isURL(stringValue)) {
      errors[field] = `${field} must be a valid URL`;
      isValid = false;
    }

    // Custom validation function
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value);
      if (customResult !== true) {
        errors[field] = customResult || `${field} is invalid`;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
};

/**
 * Sanitize input to prevent XSS and other attacks
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInputNew = (input) => {
  if (typeof input !== 'string') return input;

  return validator.escape(input.trim());
};

/**
 * Validate file upload
 * @param {Object} file - Uploaded file
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  } = options;

  const errors = [];

  if (!file) {
    errors.push('No file uploaded');
    return { isValid: false, errors };
  }

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size must not exceed ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  // MIME type validation
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Extension validation
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate image dimensions
 * @param {Object} metadata - Image metadata from Sharp
 * @param {Object} requirements - Dimension requirements
 * @returns {Object} - Validation result
 */
export const validateImageDimensions = (metadata, requirements = {}) => {
  const {
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    aspectRatio
  } = requirements;

  const errors = [];
  const { width, height } = metadata;

  if (minWidth && width < minWidth) {
    errors.push(`Image width must be at least ${minWidth}px`);
  }

  if (maxWidth && width > maxWidth) {
    errors.push(`Image width must not exceed ${maxWidth}px`);
  }

  if (minHeight && height < minHeight) {
    errors.push(`Image height must be at least ${minHeight}px`);
  }

  if (maxHeight && height > maxHeight) {
    errors.push(`Image height must not exceed ${maxHeight}px`);
  }

  if (aspectRatio) {
    const currentRatio = width / height;
    const tolerance = 0.1; // 10% tolerance
    if (Math.abs(currentRatio - aspectRatio) > tolerance) {
      errors.push(`Image aspect ratio should be approximately ${aspectRatio}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
