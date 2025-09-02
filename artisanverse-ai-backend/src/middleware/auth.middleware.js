const jwt = require('jsonwebtoken');
const dataService = require('../services/data.service');
const { generateResponse } = require('../utils/helpers');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(
        generateResponse(false, null, 'Access token is required')
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await dataService.findById('users', decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json(
        generateResponse(false, null, 'Invalid or inactive user')
      );
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();

  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        generateResponse(false, null, 'Invalid token')
      );
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        generateResponse(false, null, 'Token expired')
      );
    }

    return res.status(500).json(
      generateResponse(false, null, 'Authentication failed')
    );
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRoles = Array.isArray(roles) ? roles : [roles];

    if (!req.user || !userRoles.includes(req.user.role)) {
      return res.status(403).json(
        generateResponse(false, null, 'Insufficient permissions')
      );
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await dataService.findById('users', decoded.id);

    if (user && user.isActive) {
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // For optional auth, we don't return errors, just set user to null
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
