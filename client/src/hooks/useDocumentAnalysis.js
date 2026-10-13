import { useState } from 'react';
import { analyzeDocument } from '../services/api.js';

/**
 * Custom React hook for document analysis integration
 * Ref: docs/BACKEND_CONNECTION_GUIDE.md (Section 4.B)
 */
export function useDocumentAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  const runAnalysis = async ({ file, documentText, language, detailLevel, userQuestion }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyzeDocument({
        file,
        documentText,
        language,
        detailLevel,
        userQuestion,
      });

      setAnalysisId(response.analysisId);
      setAnalysis(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setAnalysisId(null);
    setError(null);
  };

  return { runAnalysis, loading, error, analysis, analysisId, reset };
}

export default useDocumentAnalysis;
