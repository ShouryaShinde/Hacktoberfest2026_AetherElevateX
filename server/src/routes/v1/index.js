import { Router } from 'express';
import documentRoutes from './document.routes.js';

const router = Router();

// Health check endpoint matching API_CONTRACT.md
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
  });
});

// Document routes
router.use('/documents', documentRoutes);

export default router;
