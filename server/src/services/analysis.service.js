import { DocumentAnalysisSchema } from '../validators/analysis.schema.js';
import { getCurrentProvider } from '../providers/index.js';
import { SYSTEM_PROMPT_V1 } from '../providers/gemma/prompts/systemPrompt.v1.js';
import { buildUserPrompt } from '../providers/gemma/prompts/userPrompt.js';
import { InvalidModelOutputError } from '../utils/errors.js';

/**
 * Clean and extract JSON string from raw model output
 * @param {string} raw
 * @returns {string}
 */
export const extractJsonString = (raw) => {
  if (!raw || typeof raw !== 'string') return '';

  let cleaned = raw.trim();

  // Strip markdown code fences if present (e.g. ```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // If still not starting with {, search for first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
};

/**
 * Creates bounded source chunks from document text or pages
 * @param {string} text
 * @param {Array<object>} [pages]
 * @returns {Array<{ chunk_id: string, page: number, section: string, text: string }>}
 */
export const createSourceChunks = (text, pages = []) => {
  if (Array.isArray(pages) && pages.length > 0) {
    const chunks = [];
    pages.forEach((page, index) => {
      const pageNum = page.num || index + 1;
      const pageText = (page.text || '').trim();
      if (pageText) {
        // Break into ~1500 char sections if page is long
        const sectionLength = 1500;
        let start = 0;
        let subIndex = 1;
        while (start < pageText.length) {
          const slice = pageText.slice(start, start + sectionLength);
          chunks.push({
            chunk_id: `p${pageNum}-c${subIndex}`,
            page: pageNum,
            section: `Page ${pageNum}`,
            text: slice,
          });
          start += sectionLength;
          subIndex++;
        }
      }
    });
    if (chunks.length > 0) return chunks;
  }

  // Fallback: chunk single text string
  const chunks = [];
  const chunkSize = 1500;
  let offset = 0;
  let chunkNum = 1;

  while (offset < text.length) {
    const slice = text.slice(offset, offset + chunkSize);
    chunks.push({
      chunk_id: `p1-c${chunkNum}`,
      page: 1,
      section: 'Document Body',
      text: slice,
    });
    offset += chunkSize;
    chunkNum++;
  }

  return chunks.length > 0 ? chunks : [{ chunk_id: 'p1-c1', page: 1, section: 'Document Body', text }];
};

/**
 * Validates that all source references point to known chunks
 * @param {object} analysis
 * @param {Set<string>} validChunkIds
 */
export const filterValidSourceReferences = (analysis, validChunkIds) => {
  const sanitizeRefs = (item) => {
    if (item && Array.isArray(item.source_references)) {
      item.source_references = item.source_references.filter((id) => validChunkIds.has(id));
    }
  };

  analysis.main_points?.forEach(sanitizeRefs);
  analysis.eligibility?.criteria?.forEach(sanitizeRefs);
  analysis.required_documents?.forEach(sanitizeRefs);
  analysis.important_dates?.forEach(sanitizeRefs);
  analysis.important_amounts?.forEach(sanitizeRefs);
  analysis.action_steps?.forEach(sanitizeRefs);
  analysis.warnings?.forEach(sanitizeRefs);

  analysis.user_question_answer?.evidence?.forEach(sanitizeRefs);

  return analysis;
};

/**
 * Analyzes document text and returns schema-validated result
 * @param {object} params
 * @param {string} params.text
 * @param {string} [params.language]
 * @param {string} [params.detailLevel]
 * @param {string|null} [params.userQuestion]
 * @param {Array<object>} [params.pages]
 * @param {import('../providers/base.provider.js').BaseLlmProvider} [params.providerOverride]
 * @returns {Promise<object>}
 */
export const analyzeDocumentText = async ({
  text,
  language = 'English',
  detailLevel = 'standard',
  userQuestion = null,
  pages = [],
  providerOverride = null,
}) => {
  const provider = providerOverride || getCurrentProvider();
  const sourceChunks = createSourceChunks(text, pages);
  const validChunkIds = new Set(sourceChunks.map((c) => c.chunk_id));

  const systemPrompt = SYSTEM_PROMPT_V1;
  const userPrompt = buildUserPrompt({
    documentText: text,
    userQuestion,
    language,
    detailLevel,
    sourceChunks,
  });

  const rawOutput = await provider.generateStructured({
    systemPrompt,
    userPrompt,
    schemaName: 'DocumentAnalysis',
  });

  const cleanedJson = extractJsonString(rawOutput);

  let parsed;
  try {
    parsed = JSON.parse(cleanedJson);
  } catch (error) {
    throw new InvalidModelOutputError(`Model output could not be parsed as JSON: ${error.message}`);
  }

  // Validate with Zod schema
  const validationResult = DocumentAnalysisSchema.safeParse(parsed);

  if (!validationResult.success) {
    // Attempt one repair retry if supported
    const repairPrompt = `The previous JSON response did not match the schema errors:\n${JSON.stringify(validationResult.error.format())}\n\nPlease output the corrected valid JSON object only.`;
    try {
      const repairedRaw = await provider.generateStructured({
        systemPrompt,
        userPrompt: repairPrompt,
        schemaName: 'DocumentAnalysisRepair',
      });
      const repairedJson = extractJsonString(repairedRaw);
      const repairedParsed = JSON.parse(repairedJson);
      const secondValidation = DocumentAnalysisSchema.safeParse(repairedParsed);

      if (secondValidation.success) {
        return filterValidSourceReferences(secondValidation.data, validChunkIds);
      }
    } catch {
      // Repair failed, fall through to error
    }

    throw new InvalidModelOutputError(`Model output did not match required schema: ${validationResult.error.message}`);
  }

  return filterValidSourceReferences(validationResult.data, validChunkIds);
};

export default {
  extractJsonString,
  createSourceChunks,
  filterValidSourceReferences,
  analyzeDocumentText,
};
