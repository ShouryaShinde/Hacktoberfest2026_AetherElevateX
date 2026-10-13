/**
 * Document Processing Service
 * Client-side file validation and unified analysis bridge to backend API.
 * Ref: docs/BACKEND_CONNECTION_GUIDE.md & docs/IMPLEMENTATION_PLAN.md (Phase 4)
 */

import { analyzeDocument, checkServerHealth } from './api.js';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit per API contract
export const MAX_TEXT_LENGTH_CHARS = 100000; // 100,000 characters limit
export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const ALLOWED_EXTENSIONS = ['.pdf'];

/**
 * Validates a file against allowed MIME types, extensions, and size limits.
 * @param {File} file 
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateDocumentFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a file to upload.' };
  }

  const extension = '.' + file.name.split('.').pop().toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.includes(extension);
  const hasValidMime = ALLOWED_FILE_TYPES.includes(file.type) || (file.type === '' && hasValidExt);

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Unsupported format "${extension || file.type}". Please upload a PDF file (.pdf). For other formats, you can copy and paste the document text.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10 MB limit (${formatFileSize(file.size)}). Please choose a smaller document.`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty (0 bytes). Please upload a valid document.'
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates raw pasted document text.
 * @param {string} text 
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateDocumentText(text) {
  if (!text || !text.trim()) {
    return { valid: false, error: 'Please enter or paste some document text to analyze.' };
  }

  if (text.trim().length > MAX_TEXT_LENGTH_CHARS) {
    return {
      valid: false,
      error: `Text exceeds the maximum limit of ${MAX_TEXT_LENGTH_CHARS.toLocaleString()} characters (current: ${text.length.toLocaleString()}).`
    };
  }

  return { valid: true, error: null };
}

/**
 * Formats byte size into human readable string.
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Checks backend health status.
 * @returns {Promise<{ online: boolean, message: string }>}
 */
export async function checkBackendStatus() {
  const result = await checkServerHealth();
  if (result.success) {
    return { online: true, message: `Server online (${result.status})` };
  }
  return { online: false, message: result.error || 'Server not reachable' };
}

/**
 * Handles document submission flow to the backend API.
 * @param {Object} params
 * @param {File} [params.file]
 * @param {string} [params.documentText]
 * @param {string} [params.language]
 * @param {string} [params.detailLevel]
 * @param {string} [params.userQuestion]
 * @returns {Promise<{ success: boolean, analysisId: string, data: object, fileInfo?: object }>}
 */
export async function submitDocumentForAnalysis({
  file = null,
  documentText = '',
  language = 'English',
  detailLevel = 'standard',
  userQuestion = ''
}) {
  if (file) {
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  } else {
    const textValidation = validateDocumentText(documentText);
    if (!textValidation.valid) {
      throw new Error(textValidation.error);
    }
  }

  const result = await analyzeDocument({
    file,
    documentText,
    language,
    detailLevel,
    userQuestion,
  });

  const fileInfo = file
    ? {
        name: file.name,
        size: formatFileSize(file.size),
        type: 'PDF',
        language,
        detailLevel
      }
    : {
        name: 'Pasted Document Text',
        size: `${documentText.trim().length} chars`,
        type: 'TEXT',
        language,
        detailLevel
      };

  return {
    ...result,
    fileInfo,
  };
}

export default {
  validateDocumentFile,
  validateDocumentText,
  formatFileSize,
  checkBackendStatus,
  submitDocumentForAnalysis,
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_TEXT_LENGTH_CHARS,
};
