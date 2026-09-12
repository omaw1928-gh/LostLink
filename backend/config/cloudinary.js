const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  if (process.env.CLOUDINARY_URL) {
    const rawUrl = process.env.CLOUDINARY_URL.trim();
    const match = rawUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      cloudinary.config({
        cloud_name: match[3],
        api_key: match[1],
        api_secret: match[2],
        secure: true,
      });
      console.log(`[Cloudinary] Configured successfully from CLOUDINARY_URL for cloud: ${match[3]}`);
      return true;
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret || apiKey,
      secure: true,
    });
    console.log(`[Cloudinary] Configured successfully for cloud: ${cloudName}`);
    return true;
  } else {
    console.warn('[Cloudinary Warning] Cloudinary credentials missing in .env. Image uploads will use base64 data-URI fallback.');
    return false;
  }
};


/**
 * Uploads an image (base64 Data URI, buffer, or file path) to Cloudinary
 * Exactly matches Pixel-Heist's resilient uploading architecture
 */
const uploadToCloudinary = async (imageInput, folder = 'lostlink/items') => {
  if (!imageInput) return '';

  // If already an external hosted URL (not base64 data URI), return as is
  if (typeof imageInput === 'string' && imageInput.startsWith('http') && !imageInput.startsWith('data:')) {
    return imageInput;
  }

  const isConfigured = configureCloudinary();
  if (!isConfigured) {
    return imageInput;
  }

  try {
    let uploadSource = imageInput;
    if (Buffer.isBuffer(imageInput)) {
      uploadSource = `data:image/jpeg;base64,${imageInput.toString('base64')}`;
    }

    console.log(`[Cloudinary] Uploading image to Cloudinary CDN folder: ${folder}...`);
    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: folder,
      resource_type: 'auto',
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    });

    if (result && result.secure_url) {
      console.log(`[Cloudinary] Upload successful: ${result.secure_url}`);
      return result.secure_url;
    }
    return imageInput;
  } catch (err) {
    console.warn(`[Cloudinary Upload Warning] Cloudinary upload failed: ${err.message}. Retaining source data.`);
    return imageInput;
  }
};

module.exports = { cloudinary, configureCloudinary, uploadToCloudinary };

