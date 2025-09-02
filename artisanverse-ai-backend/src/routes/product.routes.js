const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth.middleware');
const { validateProduct, validateObjectId, handleValidationErrors } = require('../middleware/validation.middleware');

// Public routes
router.get('/', optionalAuth, productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', validateObjectId(), handleValidationErrors, optionalAuth, productController.getProduct);

// Buyer routes
router.post('/:id/wishlist', 
  authenticateToken, 
  requireRole('buyer'), 
  validateObjectId(), 
  handleValidationErrors, 
  productController.toggleWishlist
);

// Artisan routes
router.post('/', 
  authenticateToken, 
  requireRole('artisan'), 
  validateProduct, 
  handleValidationErrors, 
  productController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  requireRole('artisan'), 
  validateObjectId(), 
  handleValidationErrors, 
  productController.updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  requireRole('artisan'), 
  validateObjectId(), 
  handleValidationErrors, 
  productController.deleteProduct
);

router.get('/artisan/my-products', 
  authenticateToken, 
  requireRole('artisan'), 
  productController.getArtisanProducts
);

module.exports = router;
