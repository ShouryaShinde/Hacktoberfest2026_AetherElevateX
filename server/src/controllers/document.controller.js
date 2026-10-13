import crypto from 'node:crypto';
import { processDocumentInput } from '../services/document.service.js';
import { analyzeDocumentText } from '../services/analysis.service.js';

/**
 * Handle document analyze request
 */
export const analyzeDocument = async (req, res, next) => {
  try {
    const { documentText, language, detailLevel, userQuestion } = req.body;
    const file = req.file;

    const processed = await processDocumentInput({
      file,
      documentText,
      language,
      detailLevel,
    });

    const analysisId = crypto.randomUUID();

    const analysisData = await analyzeDocumentText({
      text: processed.extractedText,
      language: processed.language,
      detailLevel: processed.detailLevel,
      userQuestion: userQuestion || null,
      pages: processed.metadata.pages || [],
    });

    return res.status(200).json({
      success: true,
      analysisId,
      data: analysisData,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  analyzeDocument,
};
