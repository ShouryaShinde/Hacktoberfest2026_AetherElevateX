import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  if (!config.mongoUri) {
    console.warn('⚠️ MONGODB_URI is not set. Database features will be unavailable.');
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // In development or testing, do not terminate the process so API health/checks remain accessible
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
