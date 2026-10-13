import crypto from 'node:crypto';
import { processDocumentInput } from '../services/document.service.js';

/**
 * Handle document analyze request
 */
export const analyzeDocument = async (req, res, next) => {
  try {
    const { documentText, language, detailLevel } = req.body;
    const file = req.file;

    const processed = await processDocumentInput({
      file,
      documentText,
      language,
      detailLevel,
    });

    const analysisId = crypto.randomUUID();

    return res.status(200).json({
      success: true,
      analysisId,
      data: {
        inputType: processed.metadata.inputType,
        language: processed.language,
        detailLevel: processed.detailLevel,
        characterCount: processed.metadata.characterCount,
        numPages: processed.metadata.numPages,
        extractedTextPreview: processed.extractedText.slice(0, 200),
        message: 'Document accepted and text extracted successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  analyzeDocument,
};
