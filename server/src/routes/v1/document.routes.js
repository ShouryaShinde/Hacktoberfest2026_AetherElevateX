import { Router } from 'express';
import uploadSinglePdf from '../../middlewares/upload.js';
import { analyzeDocument } from '../../controllers/document.controller.js';

const router = Router();

router.post('/analyze', uploadSinglePdf, analyzeDocument);

export default router;
