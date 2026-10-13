/**
 * API Service for Samjho AI Client
 * Connects frontend to Express backend API v1
 * Ref: docs/BACKEND_CONNECTION_GUIDE.md & docs/IMPLEMENTATION_PLAN.md (Phase 4)
 */

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:5000/api/v1';

/**
 * Health check endpoint
 * @returns {Promise<{ success: boolean, status?: string, error?: string }>}
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return { success: false, error: `Health check failed with HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, status: data.status || 'ok' };
  } catch (error) {
    return { success: false, error: error.message || 'Cannot connect to backend server' };
  }
}

/**
 * Analyze document via file upload or pasted text
 * @param {Object} params
 * @param {File} [params.file] - PDF file (binary)
 * @param {string} [params.documentText] - Raw text string
 * @param {string} [params.language] - 'English' | 'Hindi' | 'Marathi'
 * @param {string} [params.detailLevel] - 'simple' | 'standard' | 'detailed'
 * @param {string} [params.userQuestion] - Optional question grounded in document
 * @returns {Promise<{ success: boolean, analysisId: string, data: object }>}
 */
export async function analyzeDocument({
  file = null,
  documentText = '',
  language = 'English',
  detailLevel = 'standard',
  userQuestion = ''
}) {
  let response;

  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('detailLevel', detailLevel);
    if (userQuestion && userQuestion.trim()) {
      formData.append('userQuestion', userQuestion.trim());
    }

    try {
      response = await fetch(`${API_BASE_URL}/documents/analyze`, {
        method: 'POST',
        body: formData,
      });
    } catch (networkErr) {
      throw new Error(`Unable to reach backend server at ${API_BASE_URL}. Ensure the server is running on port 5000. (${networkErr.message})`, { cause: networkErr });
    }
  } else if (documentText && documentText.trim()) {
    try {
      response = await fetch(`${API_BASE_URL}/documents/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          documentText: documentText.trim(),
          language,
          detailLevel,
          userQuestion: userQuestion && userQuestion.trim() ? userQuestion.trim() : null,
        }),
      });
    } catch (networkErr) {
      throw new Error(`Unable to reach backend server at ${API_BASE_URL}. Ensure the server is running on port 5000. (${networkErr.message})`, { cause: networkErr });
    }
  } else {
    throw new Error('Please select a PDF document to upload or enter document text.');
  }

  let result;
  try {
    result = await response.json();
  } catch (parseErr) {
    throw new Error(`Server returned status ${response.status} with non-JSON response.`, { cause: parseErr });
  }

  if (!response.ok || !result.success) {
    const errorMsg = result?.error?.message || `Document analysis failed with status ${response.status}.`;
    const err = new Error(errorMsg);
    err.code = result?.error?.code || 'ANALYSIS_ERROR';
    err.requestId = result?.error?.requestId;
    throw err;
  }

  return result;
}

export default {
  API_BASE_URL,
  checkServerHealth,
  analyzeDocument,
};
