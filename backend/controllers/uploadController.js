const { cloudinary } = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Upload image to Cloudinary (or fallback to Data URI)
// @route   POST /api/upload
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload',
      });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary is configured with valid credentials
    if (cloudName && apiKey && apiSecret && !cloudName.includes('your_cloudinary')) {
      const uploadFromBuffer = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'lostlink/items',
              transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          Readable.from(buffer).pipe(stream);
        });
      };

      try {
        const result = await uploadFromBuffer(req.file.buffer);
        console.log(`[Cloudinary] Successfully uploaded image: ${result.secure_url}`);

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          data: {
            url: result.secure_url,
            public_id: result.public_id,
          },
        });
      } catch (uploadErr) {
        console.error(`[Cloudinary Upload Error] ${uploadErr.message || JSON.stringify(uploadErr)}`);
        return res.status(400).json({
          success: false,
          message: `Cloudinary upload failed: ${uploadErr.message || 'Invalid credentials'}. Please verify CLOUDINARY_CLOUD_NAME in backend/.env.`,
        });
      }
    } else {
      // Development Fallback: Convert buffer to inline Data URI
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      return res.status(200).json({
        success: true,
        message: 'Image processed (Local Data URI mode)',
        data: {
          url: base64Image,
          public_id: 'local_' + Date.now(),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
