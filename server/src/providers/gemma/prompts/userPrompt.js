/**
 * Builds a safely serialized JSON user prompt matching AI_PIPELINE.md
 * @param {object} params
 * @param {string} params.documentText
 * @param {string|null} [params.userQuestion]
 * @param {string} [params.language]
 * @param {string} [params.detailLevel]
 * @param {Array<object>} [params.sourceChunks]
 * @returns {string} Serialized JSON string
 */
export const buildUserPrompt = ({
  documentText,
  userQuestion = null,
  language = 'English',
  detailLevel = 'standard',
  sourceChunks = [],
}) => {
  // Provide chunk references without duplicating full document text to keep local inference fast
  const chunkRefs = Array.isArray(sourceChunks)
    ? sourceChunks.map((c) => ({ chunk_id: c.chunk_id, page: c.page }))
    : [];

  const payload = {
    document_text: documentText,
    user_question: userQuestion,
    language,
    detail_level: detailLevel,
    source_chunks: chunkRefs,
  };

  return JSON.stringify(payload);
};

export default buildUserPrompt;
