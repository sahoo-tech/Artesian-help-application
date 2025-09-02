const express = require('express');
const router = express.Router();
const artisanController = require('../controllers/artisan.controller');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth.middleware');
const { validateObjectId, handleValidationErrors } = require('../middleware/validation.middleware');

// Public routes
router.get('/', optionalAuth, artisanController.getArtisans);
router.get('/craft-types', artisanController.getCraftTypes);
router.get('/featured', artisanController.getFeaturedArtisans);
router.get('/:id', validateObjectId(), handleValidationErrors, optionalAuth, artisanController.getArtisan);

// Artisan protected routes
router.get('/dashboard/overview', 
  authenticateToken, 
  requireRole('artisan'), 
  artisanController.getArtisanDashboard
);

module.exports = router;
