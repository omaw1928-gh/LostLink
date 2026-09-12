const express = require('express');
const router = express.Router();
const { configureCloudinary, cloudinary } = require('../config/cloudinary');

// Endpoint to verify Cloudinary configuration and test connectivity
router.get('/cloudinary-status', async (req, res) => {
  const isConfigured = configureCloudinary();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'none';

  try {
    const pingResult = await cloudinary.api.ping();
    res.json({
      success: true,
      configured: isConfigured,
      cloudName,
      apiKey,
      ping: pingResult,
      message: 'Cloudinary API is reachable and credentials are valid!',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      configured: isConfigured,
      cloudName,
      apiKey,
      error: err.message || err,
      hint: 'Please check your CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in backend/.env',
    });
  }
});

module.exports = router;

