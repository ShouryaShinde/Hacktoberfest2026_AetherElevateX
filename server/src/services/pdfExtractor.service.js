import { PDFParse } from 'pdf-parse';
import { UnsupportedFileTypeError, TextExtractionError } from '../utils/errors.js';

/**
 * Validates PDF magic bytes (%PDF-)
 * @param {Buffer} buffer 
 * @returns {boolean}
 */
export const isValidPdfBuffer = (buffer) => {
  if (!buffer || buffer.length < 5) return false;
  // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
  return buffer.slice(0, 5).toString('ascii') === '%PDF-';
};

/**
 * Extracts text and page metadata from a PDF buffer
 * @param {Buffer} buffer 
 * @returns {Promise<{ text: string, numPages: number, pages: Array<{ text: string, num: number }> }>}
 */
export const extractTextFromPdf = async (buffer) => {
  if (!isValidPdfBuffer(buffer)) {
    throw new UnsupportedFileTypeError('Uploaded file is not a valid PDF document.');
  }

  try {
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const parser = new PDFParse(uint8Array);
    await parser.load();

    const textResult = await parser.getText();
    const pages = textResult.pages || [];
    const numPages = textResult.total || pages.length || 1;

    // Clean up parser resources if destroy method is available
    if (typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch {
        // ignore destroy errors
      }
    }

    return {
      text: textResult.text || '',
      numPages,
      pages,
    };
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError) {
      throw error;
    }
    throw new TextExtractionError(`Failed to extract text from PDF: ${error.message}`);
  }
};

export default {
  isValidPdfBuffer,
  extractTextFromPdf,
};
