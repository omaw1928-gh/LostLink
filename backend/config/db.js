const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google & Cloudflare Public DNS (8.8.8.8 / 1.1.1.1)
// to prevent ISP/Windows DNS blocking of MongoDB Atlas _mongodb._tcp SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;
  const fallbackURI = process.env.FALLBACK_MONGODB_URI || 'mongodb://mongo:27017/lostlink';

  // 1. Try Primary Cloud Database (MongoDB Atlas)
  if (primaryURI) {
    try {
      const conn = await mongoose.connect(primaryURI, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[Database] Connected to Primary Cloud Database: ${conn.connection.host}`);
      return;
    } catch (primaryErr) {
      console.warn(`[Database Warning] Primary connection failed (${primaryErr.message}).`);
      console.log(`[Database Failover] Activating failover database at ${fallbackURI}...`);
    }
  }

  // 2. Try Fallback Database (Containerized / Local)
  try {
    const conn = await mongoose.connect(fallbackURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Failover Database Active: ${conn.connection.host}`);
  } catch (fallbackErr) {
    console.error(`[Database Error] Fallback database failed: ${fallbackErr.message}`);
    // Keep server process running so /api/health responds
  }
};

module.exports = connectDB;

