const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Upload image to Cloudinary (or fallback to Data URI)
// @route   POST /api/upload
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    let imageSource = null;

    if (req.file) {
      imageSource = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body && req.body.image) {
      imageSource = req.body.image;
    }

    if (!imageSource) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file or base64 image string to upload',
      });
    }

    // Determine target subfolder in Cloudinary: lostlink/lost, lostlink/found, lostlink/items, etc.
    const subfolder = (req.body.folder || req.body.type || 'items').toString().toLowerCase().trim();
    const cloudinaryFolder = `lostlink/${subfolder}`;

    const uploadedUrl = await uploadToCloudinary(imageSource, cloudinaryFolder);

    const isCloudinaryUrl = uploadedUrl && uploadedUrl.includes('cloudinary.com');

    return res.status(200).json({
      success: true,
      message: isCloudinaryUrl
        ? `Image uploaded successfully to Cloudinary folder '${cloudinaryFolder}'`
        : 'Image processed (Data URI fallback mode)',
      data: {
        url: uploadedUrl,
        public_id: 'img_' + Date.now(),
        folder: cloudinaryFolder,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };

