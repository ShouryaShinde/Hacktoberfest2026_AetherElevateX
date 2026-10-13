import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/index.js';

dotenv.config();

const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
