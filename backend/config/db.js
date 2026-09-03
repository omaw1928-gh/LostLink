const mongoose = require('mongoose');
const dns = require('dns');

// Use public DNS servers to resolve MongoDB Atlas SRV records
// (some local/ISP DNS servers fail to resolve _mongodb._tcp SRV queries)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostlink';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.warn(`[Database Note] If using MongoDB Atlas, check your IP whitelist and MONGODB_URI in backend/.env`);
    // Do not crash the entire node process abruptly in dev so other routes/mock tests can communicate status
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
