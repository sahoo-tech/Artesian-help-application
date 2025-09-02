const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { generateResponse, sanitizeFilename } = require('../utils/helpers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads', file.fieldname || 'general');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(path.parse(file.originalname).name);
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${sanitizedName}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'document': ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'model': ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    'video': ['video/mp4', 'video/webm', 'video/ogg']
  };

  const fileType = file.fieldname || 'image';
  const allowedMimeTypes = allowedTypes[fileType] || allowedTypes.image;

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${fileType}: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files per request
  },
  fileFilter: fileFilter
});

// Middleware for different upload types
const uploadSingle = (fieldName, fileType = 'image') => {
  return (req, res, next) => {
    req.fileType = fileType;
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json(
            generateResponse(false, null, 'File too large. Maximum size is 10MB.')
          );
        }
        return res.status(400).json(
          generateResponse(false, null, err.message)
        );
      }
      next();
    });
  };
};

const uploadMultiple = (fieldName, maxCount = 5, fileType = 'image') => {
  return (req, res, next) => {
    req.fileType = fileType;
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json(
            generateResponse(false, null, 'One or more files are too large. Maximum size is 10MB per file.')
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json(
            generateResponse(false, null, `Too many files. Maximum allowed: ${maxCount}`)
          );
        }
        return res.status(400).json(
          generateResponse(false, null, err.message)
        );
      }
      next();
    });
  };
};

// Image processing middleware
const processImages = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (file && file.mimetype.startsWith('image/')) {
        const originalPath = file.path;
        const processedPath = originalPath.replace(/\.[^.]+$/, '_processed.jpg');

        // Create optimized version
        await sharp(originalPath)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toFile(processedPath);

        // Create thumbnail
        const thumbnailPath = originalPath.replace(/\.[^.]+$/, '_thumb.jpg');
        await sharp(originalPath)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 75 })
          .toFile(thumbnailPath);

        processedFiles.push({
          ...file,
          processedPath,
          thumbnailPath,
          url: `/uploads/${path.basename(path.dirname(file.path))}/${path.basename(file.path)}`,
          processedUrl: `/uploads/${path.basename(path.dirname(processedPath))}/${path.basename(processedPath)}`,
          thumbnailUrl: `/uploads/${path.basename(path.dirname(thumbnailPath))}/${path.basename(thumbnailPath)}`
        });
      } else {
        processedFiles.push({
          ...file,
          url: `/uploads/${path.basename(path.dirname(file.path))}/${path.basename(file.path)}`
        });
      }
    }

    if (req.files) {
      req.processedFiles = processedFiles;
    } else {
      req.processedFile = processedFiles[0];
    }

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(); // Continue even if processing fails
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  processImages,
  upload
};
