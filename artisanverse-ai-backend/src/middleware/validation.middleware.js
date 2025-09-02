const { body, param, validationResult } = require('express-validator');
const { generateResponse } = require('../utils/helpers');

// Validation rules
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['buyer', 'artisan', 'admin'])
    .withMessage('Role must be buyer, artisan, or admin'),

  body('craftType')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Craft type must be between 2 and 100 characters'),

  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProduct = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Product title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),

  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Invalid currency code'),

  body('category')
    .notEmpty()
    .withMessage('Category is required'),

  body('inStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be an array'),

  body('techniques')
    .optional()
    .isArray()
    .withMessage('Techniques must be an array')
];

const validateObjectId = () => [
  param('id')
    .isLength({ min: 1 })
    .withMessage('Invalid ID format')
];

const validateAIChat = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),

  body('category')
    .optional()
    .isIn(['business', 'marketing', 'pricing'])
    .withMessage('Invalid category')
];

const validateEmail = [
  body('to')
    .isEmail()
    .withMessage('Valid recipient email is required'),

  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('message')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json(
      generateResponse(false, null, errorMessages.join(', '))
    );
  }

  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potentially dangerous characters
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
    }
    return value;
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateObjectId,
  validateAIChat,
  validateEmail,
  handleValidationErrors,
  sanitizeInput
};