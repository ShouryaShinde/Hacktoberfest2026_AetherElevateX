import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

// Backward compatibility health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// API version 1 routes
router.use('/v1', v1Routes);

export default router;
