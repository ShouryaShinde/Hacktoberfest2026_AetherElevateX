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
 * Strictly validates and filters model output against actual extracted document text.
 * Strips fabricated dates, amounts, criteria, and evidence not found in source text.
 * @param {object} analysis
 * @param {string} text
 * @param {Set<string>} validChunkIds
 * @returns {object}
 */
export const validateAndSanitizeGrounding = (analysis, text, validChunkIds) => {
  const lowerText = text.toLowerCase();
  const STOP_WORDS = new Set(['the', 'is', 'are', 'was', 'were', 'and', 'or', 'to', 'in', 'on', 'at', 'by', 'for', 'of', 'a', 'an', 'this', 'that', 'with', 'from', 'as', 'it', 'will', 'be']);

  const textIncludesSnippet = (snippet) => {
    if (!snippet) return false;
    const clean = String(snippet).toLowerCase().trim();
    if (lowerText.includes(clean)) return true;
    const tokens = clean.split(/[\s,.-]+/).filter((t) => t.length > 2);
    if (tokens.length === 0) return false;
    return tokens.every((t) => lowerText.includes(t));
  };

  const isAnswerGrounded = (answer) => {
    if (!answer) return false;
    const clean = String(answer).toLowerCase().trim();
    if (lowerText.includes(clean)) return true;
    const contentTokens = clean
      .split(/[\s,.-]+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
    if (contentTokens.length === 0) return true;
    const matchingCount = contentTokens.filter((t) => lowerText.includes(t)).length;
    return matchingCount / contentTokens.length >= 0.5;
  };

  // 1. Sanitize dates: keep only dates whose date_original or numbers exist in text
  if (Array.isArray(analysis.important_dates)) {
    analysis.important_dates = analysis.important_dates.filter((d) => {
      if (!d || !d.date_original) return false;
      const cleanDate = d.date_original.toLowerCase().trim();
      return lowerText.includes(cleanDate) || textIncludesSnippet(cleanDate);
    });
  }

  // 2. Sanitize amounts: keep only amounts that exist in text
  if (Array.isArray(analysis.important_amounts)) {
    analysis.important_amounts = analysis.important_amounts.filter((a) => {
      if (!a || !a.amount_original) return false;
      const cleanAmt = a.amount_original.toLowerCase().trim();
      const numOnly = cleanAmt.replace(/[^\d.]/g, '');
      return lowerText.includes(cleanAmt) || (numOnly.length > 0 && lowerText.includes(numOnly));
    });
  }

  // 3. Sanitize eligibility: if no criteria supported by text, mark applicable = false
  if (analysis.eligibility && Array.isArray(analysis.eligibility.criteria)) {
    analysis.eligibility.criteria = analysis.eligibility.criteria.filter((c) => {
      return textIncludesSnippet(c.requirement) || textIncludesSnippet(c.details);
    });
    if (analysis.eligibility.criteria.length === 0) {
      analysis.eligibility.applicable = false;
    }
  }

  // 4. Sanitize Q&A evidence: verify evidence text matches source text
  if (analysis.user_question_answer && Array.isArray(analysis.user_question_answer.evidence)) {
    analysis.user_question_answer.evidence = analysis.user_question_answer.evidence.filter((ev) => {
      return ev && ev.text && textIncludesSnippet(ev.text.slice(0, 30));
    });
    if (analysis.user_question_answer.question && analysis.user_question_answer.evidence.length === 0) {
      if (!isAnswerGrounded(analysis.user_question_answer.answer)) {
        analysis.user_question_answer.answer = 'The provided document does not contain enough information to answer this question.';
        analysis.user_question_answer.confidence = 'low';
      }
    }
  }

  // 5. Filter chunk IDs to ensure all source_references are valid
  return filterValidSourceReferences(analysis, validChunkIds);
};

/**
 * Normalizes raw model output to conform reliably to DocumentAnalysisSchema
 * @param {any} raw
 * @param {object} options
 * @returns {object}
 */
export const normalizeModelOutput = (raw, { language = 'English', userQuestion = null, sourceChunks = [], text = '' } = {}) => {
  if (!raw || typeof raw !== 'object') {
    return {
      success: true,
      language,
      document_type: 'Document',
      title: null,
      summary: text ? text.slice(0, 300) : '',
      main_points: [],
      eligibility: { applicable: false, criteria: [], notes: null },
      required_documents: [],
      important_dates: [],
      important_amounts: [],
      action_steps: [],
      warnings: [],
      user_question_answer: {
        question: userQuestion || null,
        answer: userQuestion ? 'The provided document does not contain enough information to answer this question.' : null,
        evidence: [],
        confidence: 'low',
      },
      missing_information: [],
      disclaimer: 'Please verify critical deadlines and official requirements with the issuing authority.',
    };
  }

  const out = { ...raw };

  out.success = true;
  out.language = typeof out.language === 'string' && out.language.trim() ? out.language : language;
  out.document_type = typeof out.document_type === 'string' && out.document_type.trim() ? out.document_type : 'Document';
  out.title = typeof out.title === 'string' && out.title.trim() ? out.title : null;
  out.summary = typeof out.summary === 'string' && out.summary.trim() ? out.summary : (text ? text.slice(0, 300) : '');

  // Main points
  if (Array.isArray(out.main_points)) {
    out.main_points = out.main_points.map((p, idx) => {
      if (typeof p === 'string') return { heading: `Key Point ${idx + 1}`, explanation: p, source_references: [] };
      return {
        heading: p?.heading || `Key Point ${idx + 1}`,
        explanation: p?.explanation || p?.details || p?.text || '',
        source_references: Array.isArray(p?.source_references) ? p.source_references : [],
      };
    });
  } else {
    out.main_points = [];
  }

  // Eligibility
  if (out.eligibility && typeof out.eligibility === 'object') {
    const crit = Array.isArray(out.eligibility.criteria)
      ? out.eligibility.criteria.map((c) => {
          if (typeof c === 'string') return { requirement: c, details: '', mandatory: true, source_references: [] };
          return {
            requirement: c?.requirement || c?.name || 'Requirement',
            details: c?.details || '',
            mandatory: typeof c?.mandatory === 'boolean' ? c.mandatory : true,
            source_references: Array.isArray(c?.source_references) ? c.source_references : [],
          };
        })
      : [];
    out.eligibility = {
      applicable: typeof out.eligibility.applicable === 'boolean' ? out.eligibility.applicable : crit.length > 0,
      criteria: crit,
      notes: out.eligibility.notes || null,
    };
  } else {
    out.eligibility = { applicable: false, criteria: [], notes: null };
  }

  // Required documents
  if (Array.isArray(out.required_documents)) {
    out.required_documents = out.required_documents.map((d) => {
      if (typeof d === 'string') return { name: d, details: null, mandatory: true, source_references: [] };
      return {
        name: d?.name || d?.document || 'Document',
        details: d?.details || null,
        mandatory: typeof d?.mandatory === 'boolean' ? d.mandatory : true,
        source_references: Array.isArray(d?.source_references) ? d.source_references : [],
      };
    });
  } else {
    out.required_documents = [];
  }

  // Important dates
  if (Array.isArray(out.important_dates)) {
    out.important_dates = out.important_dates.map((d) => {
      const orig = d?.date_original || d?.original_text || d?.date || d?.value || '';
      let iso = d?.date_iso || d?.iso_date || null;
      if (typeof iso === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso = null;
      return {
        event: d?.event || d?.description || d?.label || 'Important Date',
        date_original: String(orig),
        date_iso: iso,
        details: d?.details || null,
        source_references: Array.isArray(d?.source_references) ? d.source_references : [],
      };
    }).filter((d) => Boolean(d.date_original));
  } else {
    out.important_dates = [];
  }

  // Important amounts
  if (Array.isArray(out.important_amounts)) {
    out.important_amounts = out.important_amounts.map((a) => {
      const orig = a?.amount_original || a?.amount || a?.value || '';
      return {
        description: a?.description || a?.label || a?.details || 'Fee / Amount',
        amount_original: String(orig),
        details: a?.details || null,
        source_references: Array.isArray(a?.source_references) ? a.source_references : [],
      };
    }).filter((a) => Boolean(a.amount_original));
  } else {
    out.important_amounts = [];
  }

  // Action steps
  if (Array.isArray(out.action_steps)) {
    out.action_steps = out.action_steps.map((s, idx) => {
      if (typeof s === 'string') {
        return {
          id: `step-${idx + 1}`,
          step: idx + 1,
          action: s,
          details: null,
          priority: 'medium',
          deadline: null,
          source_references: [],
        };
      }
      const rawPriority = String(s?.priority || '').toLowerCase();
      const validPriority = ['high', 'medium', 'low'].includes(rawPriority) ? rawPriority : 'medium';
      return {
        id: s?.id || `step-${idx + 1}`,
        step: typeof s?.step === 'number' ? s.step : (parseInt(s?.step, 10) || idx + 1),
        action: s?.action || s?.step || s?.description || s?.title || 'Action step',
        details: s?.details || null,
        priority: validPriority,
        deadline: s?.deadline || null,
        source_references: Array.isArray(s?.source_references) ? s.source_references : [],
      };
    });
  } else {
    out.action_steps = [];
  }

  // Warnings
  if (Array.isArray(out.warnings)) {
    out.warnings = out.warnings.map((w) => {
      if (typeof w === 'string') {
        return { type: 'Notice', message: w, source_references: [] };
      }
      return {
        type: w?.type || 'Notice',
        message: w?.message || w?.text || '',
        source_references: Array.isArray(w?.source_references) ? w.source_references : [],
      };
    }).filter((w) => Boolean(w.message));
  } else {
    out.warnings = [];
  }

  // User question answer
  if (typeof out.user_question_answer === 'string') {
    out.user_question_answer = {
      question: userQuestion || null,
      answer: out.user_question_answer,
      evidence: [],
      confidence: 'high',
    };
  } else if (out.user_question_answer && typeof out.user_question_answer === 'object') {
    const rawConf = String(out.user_question_answer.confidence || '').toLowerCase();
    const conf = ['high', 'medium', 'low'].includes(rawConf) ? rawConf : (userQuestion ? 'medium' : 'low');
    const ev = Array.isArray(out.user_question_answer.evidence)
      ? out.user_question_answer.evidence.map((e) => {
          if (typeof e === 'string') return { text: e, source_references: [] };
          return {
            text: e?.text || '',
            source_references: Array.isArray(e?.source_references) ? e.source_references : [],
          };
        })
      : [];
    out.user_question_answer = {
      question: out.user_question_answer.question || userQuestion || null,
      answer: out.user_question_answer.answer || null,
      evidence: ev,
      confidence: conf,
    };
  } else {
    out.user_question_answer = {
      question: userQuestion || null,
      answer: userQuestion ? 'The provided document does not contain enough information to answer this question.' : null,
      evidence: [],
      confidence: 'low',
    };
  }

  // Missing info & disclaimer
  out.missing_information = Array.isArray(out.missing_information) ? out.missing_information : [];
  out.disclaimer = out.disclaimer || 'Please verify critical deadlines and official requirements with the issuing authority.';

  return out;
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

  // Normalize model output to ensure schema compatibility
  const normalized = normalizeModelOutput(parsed, {
    language,
    userQuestion,
    sourceChunks,
    text,
  });

  // Validate with Zod schema
  const validationResult = DocumentAnalysisSchema.safeParse(normalized);

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
      const repairedNormalized = normalizeModelOutput(repairedParsed, {
        language,
        userQuestion,
        sourceChunks,
        text,
      });
      const secondValidation = DocumentAnalysisSchema.safeParse(repairedNormalized);

      if (secondValidation.success) {
        return validateAndSanitizeGrounding(secondValidation.data, text, validChunkIds);
      }
    } catch {
      // Repair failed, fall through to error
    }

    throw new InvalidModelOutputError(`Model output did not match required schema: ${validationResult.error.message}`);
  }

  return validateAndSanitizeGrounding(validationResult.data, text, validChunkIds);
};

export default {
  extractJsonString,
  createSourceChunks,
  filterValidSourceReferences,
  normalizeModelOutput,
  validateAndSanitizeGrounding,
  analyzeDocumentText,
};

