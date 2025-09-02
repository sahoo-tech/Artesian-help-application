const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth.middleware');
const { validateAIChat, handleValidationErrors } = require('../middleware/validation.middleware');

// AI Mentor routes (for artisans)
router.post('/mentor/chat', 
  authenticateToken, 
  requireRole('artisan'), 
  validateAIChat, 
  handleValidationErrors, 
  aiController.mentorChat
);

router.get('/mentor/history', 
  authenticateToken, 
  requireRole('artisan'), 
  aiController.getConversationHistory
);

// AI Shopper routes (for buyers and guests)
router.post('/shopper/chat', 
  optionalAuth, 
  validateAIChat, 
  handleValidationErrors, 
  aiController.shopperChat
);

// AI Generation routes (for artisans)
router.post('/generate/product-description', 
  authenticateToken, 
  requireRole('artisan'), 
  aiController.generateProductDescription
);

router.post('/generate/artisan-profile', 
  authenticateToken, 
  requireRole('artisan'), 
  aiController.generateArtisanProfile
);

router.post('/generate/pricing-suggestion', 
  authenticateToken, 
  requireRole('artisan'), 
  aiController.generatePricingSuggestion
);

// Cultural content routes (public)
router.get('/cultural-stories', 
  aiController.getCulturalStories
);

module.exports = router;
