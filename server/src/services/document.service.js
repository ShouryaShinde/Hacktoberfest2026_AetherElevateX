import config from '../config/index.js';
import { extractTextFromPdf } from './pdfExtractor.service.js';
import {
  ValidationError,
  EmptyDocumentError,
  FileTooLargeError,
} from '../utils/errors.js';

const ALLOWED_LANGUAGES = ['English', 'Hindi', 'Marathi'];
const ALLOWED_DETAIL_LEVELS = ['simple', 'standard', 'detailed'];

/**
 * Validates and extracts text from an uploaded file or pasted text string.
 * @param {object} params
 * @param {Express.Multer.File} [params.file]
 * @param {string} [params.documentText]
 * @param {string} [params.language]
 * @param {string} [params.detailLevel]
 * @returns {Promise<{ extractedText: string, metadata: object, language: string, detailLevel: string }>}
 */
export const processDocumentInput = async ({
  file,
  documentText,
  language = 'English',
  detailLevel = 'standard',
}) => {
  // Validate presence: exactly one of file or documentText
  const hasFile = Boolean(file);
  const hasText = typeof documentText === 'string' && documentText.trim().length > 0;

  if (!hasFile && !hasText) {
    if (typeof documentText === 'string' && documentText.trim().length === 0) {
      throw new EmptyDocumentError('The document text is empty.');
    }
    throw new ValidationError('Please provide either a PDF file or pasted document text.');
  }

  if (hasFile && typeof documentText === 'string' && documentText.trim().length > 0) {
    throw new ValidationError('Please provide either a file or documentText, not both.');
  }

  // Validate language & detail level
  const resolvedLanguage = ALLOWED_LANGUAGES.includes(language) ? language : 'English';
  const resolvedDetailLevel = ALLOWED_DETAIL_LEVELS.includes(detailLevel) ? detailLevel : 'standard';

  let rawText = '';
  let metadata = {
    inputType: hasFile ? 'pdf' : 'text',
    numPages: 1,
    fileSize: hasFile ? file.size : Buffer.byteLength(documentText, 'utf8'),
  };

  if (hasFile) {
    const pdfResult = await extractTextFromPdf(file.buffer);
    rawText = pdfResult.text;
    metadata.numPages = pdfResult.numPages;
    metadata.info = pdfResult.info;
  } else {
    rawText = documentText;
  }

  const cleanedText = rawText.trim();

  // Validate extracted text content
  if (!cleanedText) {
    throw new EmptyDocumentError(
      hasFile
        ? 'The uploaded PDF does not contain extractable text (it may be a scanned image or empty document).'
        : 'The document text contains no readable characters.'
    );
  }

  if (cleanedText.length > config.maxExtractedChars) {
    throw new FileTooLargeError(
      `Extracted document text (${cleanedText.length} characters) exceeds the maximum allowed limit of ${config.maxExtractedChars} characters.`
    );
  }

  metadata.characterCount = cleanedText.length;

  return {
    extractedText: cleanedText,
    metadata,
    language: resolvedLanguage,
    detailLevel: resolvedDetailLevel,
  };
};

export default {
  processDocumentInput,
};
