import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import requestId from './middlewares/requestId.js';
import apiRateLimiter from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import { AppError } from './utils/errors.js';

const app = express();

// Security and utility middlewares
app.use(requestId);
app.use(cors({
  origin: config.webOrigin === '*' ? '*' : [config.webOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Rate limiting on API routes
app.use('/api', apiRateLimiter);

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Mount all API routes
app.use('/api', routes);

// 404 handler for unmatched routes (Express 5 compatible)
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
