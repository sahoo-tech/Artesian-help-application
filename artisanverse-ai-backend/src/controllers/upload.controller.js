const { generateResponse } = require('../utils/helpers');

class UploadController {
  async uploadSingleFile(req, res) {
    try {
      if (!req.file && !req.processedFile) {
        return res.status(400).json(
          generateResponse(false, null, 'No file uploaded')
        );
      }

      const fileData = req.processedFile || req.file;

      res.json(
        generateResponse(true, {
          file: {
            originalName: fileData.originalname,
            filename: fileData.filename,
            size: fileData.size,
            mimetype: fileData.mimetype,
            url: fileData.url,
            processedUrl: fileData.processedUrl,
            thumbnailUrl: fileData.thumbnailUrl
          }
        }, 'File uploaded successfully')
      );

    } catch (error) {
      console.error('Single file upload error:', error);
      res.status(500).json(
        generateResponse(false, null, 'File upload failed: ' + error.message)
      );
    }
  }

  async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(
          generateResponse(false, null, 'No files uploaded')
        );
      }

      const files = req.processedFiles || req.files;

      const filesData = files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: file.url,
        processedUrl: file.processedUrl,
        thumbnailUrl: file.thumbnailUrl
      }));

      res.json(
        generateResponse(true, {
          files: filesData,
          count: filesData.length
        }, `${filesData.length} files uploaded successfully`)
      );

    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json(
        generateResponse(false, null, 'File upload failed: ' + error.message)
      );
    }
  }

  async uploadAvatar(req, res) {
    try {
      if (!req.file && !req.processedFile) {
        return res.status(400).json(
          generateResponse(false, null, 'No avatar image uploaded')
        );
      }

      const fileData = req.processedFile || req.file;

      // You could update the user's avatar URL in the database here
      // await dataService.update('users', req.user.id, { avatar: fileData.url });

      res.json(
        generateResponse(true, {
          avatar: {
            url: fileData.url,
            thumbnailUrl: fileData.thumbnailUrl
          }
        }, 'Avatar uploaded successfully')
      );

    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Avatar upload failed: ' + error.message)
      );
    }
  }

  async uploadProductImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(
          generateResponse(false, null, 'No product images uploaded')
        );
      }

      const files = req.processedFiles || req.files;

      const images = files.map(file => ({
        url: file.processedUrl || file.url,
        thumbnailUrl: file.thumbnailUrl,
        originalName: file.originalname,
        size: file.size
      }));

      res.json(
        generateResponse(true, { images }, 'Product images uploaded successfully')
      );

    } catch (error) {
      console.error('Product images upload error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Product images upload failed: ' + error.message)
      );
    }
  }

  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(
          generateResponse(false, null, 'No document uploaded')
        );
      }

      const fileData = req.file;

      res.json(
        generateResponse(true, {
          document: {
            originalName: fileData.originalname,
            filename: fileData.filename,
            size: fileData.size,
            mimetype: fileData.mimetype,
            url: fileData.url
          }
        }, 'Document uploaded successfully')
      );

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Document upload failed: ' + error.message)
      );
    }
  }

  async upload3DModel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(
          generateResponse(false, null, 'No 3D model uploaded')
        );
      }

      const fileData = req.file;

      res.json(
        generateResponse(true, {
          model: {
            originalName: fileData.originalname,
            filename: fileData.filename,
            size: fileData.size,
            mimetype: fileData.mimetype,
            url: fileData.url,
            arReady: true // Assuming GLB/GLTF files are AR-ready
          }
        }, '3D model uploaded successfully')
      );

    } catch (error) {
      console.error('3D model upload error:', error);
      res.status(500).json(
        generateResponse(false, null, '3D model upload failed: ' + error.message)
      );
    }
  }
}

module.exports = new UploadController();
