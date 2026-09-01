const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log('[Cloudinary] Cloudinary configured successfully.');
    return true;
  } else {
    console.warn('[Cloudinary Warning] Cloudinary credentials missing in .env. Image uploads will use base64 data-URI fallback.');
    return false;
  }
};

module.exports = { cloudinary, configureCloudinary };
