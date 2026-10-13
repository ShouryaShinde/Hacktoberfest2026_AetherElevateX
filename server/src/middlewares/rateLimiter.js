import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimitWindowMs,
    max: options.max || config.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const reqId = req.id || 'unknown';
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests, please try again later.',
          requestId: reqId,
        },
      });
    },
    ...options,
  });
};

export const apiRateLimiter = createRateLimiter();

export default apiRateLimiter;
