/**
 * Document Processing Service
 * Handles client-side file validation, file inspection, and backend integration checking.
 * Strictly adheres to MVP boundaries: no fabricated AI outputs when the backend is not yet connected.
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit per API contract
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];
export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

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
      error: `Unsupported format "${extension || file.type}". Please upload a PDF, PNG, JPG, or JPEG file.`
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
 * Formats byte size into human readable string.
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
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
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  try {
    const response = await fetch(`${apiBase}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      return { online: true, message: data.message || 'Server online' };
    }
    return { online: false, message: `Server returned status ${response.status}` };
  } catch {
    return { online: false, message: 'Server not reachable' };
  }
}

/**
 * Handles document submission flow.
 * Checks for live endpoint and reports actual server readiness without fabricating AI data.
 * @param {File} file 
 * @param {string} language 
 * @param {string} detailLevel 
 * @returns {Promise<{ success: boolean, backendReady: boolean, message: string, fileInfo: object }>}
 */
export async function submitDocumentForAnalysis(file, language = 'English', detailLevel = 'standard') {
  const validation = validateDocumentFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileInfo = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || file.name.split('.').pop().toUpperCase(),
    language,
    detailLevel
  };

  // Inspect if backend analysis endpoint exists
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('detailLevel', detailLevel);

    const res = await fetch(`${apiBase}/v1/documents/analyze`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        backendReady: true,
        message: 'Analysis completed successfully.',
        data,
        fileInfo
      };
    }
  } catch {
    // Expected in Phase 0 / Phase 1: backend endpoint is not yet connected
  }

  // Truthful response: Document is validated, but server pipeline is pending Phase 2/3
  return {
    success: true,
    backendReady: false,
    message: 'File successfully validated on the client! The backend AI processing pipeline (Phase 2 & 3) is currently under active construction. The interface and validation are ready.',
    fileInfo
  };
}
