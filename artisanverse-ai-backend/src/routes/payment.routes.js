const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { validateObjectId, handleValidationErrors } = require('../middleware/validation.middleware');

// Payment creation routes
router.post('/create-intent', 
  authenticateToken, 
  requireRole('buyer'), 
  paymentController.createPaymentIntent
);

router.post('/confirm', 
  authenticateToken, 
  paymentController.confirmPayment
);

// Information routes
router.get('/methods', 
  paymentController.getPaymentMethods
);

router.get('/order/:orderId/status', 
  authenticateToken, 
  validateObjectId('orderId'), 
  handleValidationErrors, 
  paymentController.getOrderStatus
);

router.get('/orders', 
  authenticateToken, 
  paymentController.getUserOrders
);

module.exports = router;
