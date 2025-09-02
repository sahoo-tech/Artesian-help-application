const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { uploadSingle, uploadMultiple, processImages } = require('../middleware/upload.middleware');

// Single file upload
router.post('/single', 
  authenticateToken,
  uploadSingle('file'),
  processImages,
  uploadController.uploadSingleFile
);

// Multiple files upload
router.post('/multiple', 
  authenticateToken,
  uploadMultiple('files', 5),
  processImages,
  uploadController.uploadMultipleFiles
);

// Avatar upload
router.post('/avatar', 
  authenticateToken,
  uploadSingle('avatar'),
  processImages,
  uploadController.uploadAvatar
);

// Product images upload
router.post('/product-images', 
  authenticateToken,
  uploadMultiple('productImages', 8),
  processImages,
  uploadController.uploadProductImages
);

// Document upload
router.post('/document', 
  authenticateToken,
  uploadSingle('document', 'document'),
  uploadController.uploadDocument
);

// 3D model upload
router.post('/3d-model', 
  authenticateToken,
  uploadSingle('model', 'model'),
  uploadController.upload3DModel
);

module.exports = router;
