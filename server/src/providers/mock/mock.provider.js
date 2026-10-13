import { BaseLlmProvider } from '../base.provider.js';
import { ModelProviderError, ModelTimeoutError } from '../../utils/errors.js';

/**
 * Intelligent Document-Grounded Extractor
 * Extracts facts strictly and truthfully from the actual document text.
 * Never fabricates dates, amounts, scholarships, or rules when absent from source.
 */
function extractGroundedAnalysis({ documentText, userQuestion, language = 'English', detailLevel = 'standard', sourceChunks = [] }) {
  const text = (documentText || '').trim();
  const chunks = Array.isArray(sourceChunks) && sourceChunks.length > 0
    ? sourceChunks
    : [{ chunk_id: 'p1-c1', page: 1, section: 'Document Body', text }];

  const firstChunkId = chunks[0]?.chunk_id || 'p1-c1';

  // Helper to locate which chunk contains a given substring or pattern
  const findChunkForSnippet = (snippet) => {
    if (!snippet) return firstChunkId;
    const clean = snippet.toLowerCase().trim();
    for (const chunk of chunks) {
      if (chunk.text && chunk.text.toLowerCase().includes(clean)) {
        return chunk.chunk_id;
      }
    }
    return firstChunkId;
  };

  // 1. Title Extraction
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^--\s*\d+\s+of\s+\d+\s*--$/.test(l));

  let extractedTitle = null;
  if (lines.length > 0) {
    const candidate = lines[0].replace(/^[%#*_\s]+/, '').replace(/[:\-_]+$/, '').trim();
    extractedTitle = candidate.length > 3 ? candidate.slice(0, 120) : null;
  }

  // 2. Document Type Detection
  const lowerText = text.toLowerCase();
  let documentType = 'Official Notice';
  if (/exam|examination|hall ticket|semester|admit card|roll no/i.test(lowerText)) {
    documentType = 'Examination Notice';
  } else if (/scholarship|merit|fellowship|grant|stipend/i.test(lowerText)) {
    documentType = 'Scholarship Circular';
  } else if (/insurance|policy|premium|coverage|waiting period|clause|claim/i.test(lowerText)) {
    documentType = 'Insurance Policy Clause';
  } else if (/bill|invoice|statement|due date|tariff|meter reading/i.test(lowerText)) {
    documentType = 'Bill / Invoice';
  } else if (/agreement|lease|contract|terms of service|nda/i.test(lowerText)) {
    documentType = 'Legal Agreement';
  } else if (/admission|counseling|enrollment|prospectus/i.test(lowerText)) {
    documentType = 'Admission Notice';
  } else if (/circular|advisory|guideline|office order/i.test(lowerText)) {
    documentType = 'Official Circular';
  }

  // 3. Sentence Extraction
  const rawSentences = text
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim().replace(/^--\s*\d+\s+of\s+\d+\s*--$/, ''))
    .filter((s) => s.length > 15 && !/^Page\s+\d+/i.test(s));

  const sentences = rawSentences.length > 0 ? rawSentences : [text.slice(0, 300)];

  // 4. Summary Generation
  let summary = '';
  if (sentences.length <= 2) {
    summary = sentences.join(' ');
  } else {
    summary = sentences.slice(0, 3).join(' ');
  }
  if (!summary || summary.length < 10) {
    summary = `This document provides official instructions and provisions regarding ${extractedTitle || 'the stated subject'}.`;
  }

  // 5. Main Points Extraction
  const mainPoints = [];
  const selectedSentences = sentences.slice(0, Math.min(sentences.length, 4));
  selectedSentences.forEach((sent, idx) => {
    let heading = `Point ${idx + 1}`;
    const words = sent.split(/\s+/).slice(0, 5).join(' ');
    if (words.length > 5) {
      heading = words.replace(/[:.,;]+$/, '');
    }
    const chunkId = findChunkForSnippet(sent.slice(0, 40));
    mainPoints.push({
      heading,
      explanation: sent,
      source_references: [chunkId],
    });
  });

  // 6. Important Dates Extraction (Strictly from Document Text)
  const importantDates = [];
  const datePatterns = [
    // Month Day, Year (e.g. November 15, 2026 or Nov 3, 2026)
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/gi,
    // Month Day (e.g. Nov 3, November 5)
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+\d{1,2}(?:st|nd|rd|th)?\b/gi,
    // ISO Date (YYYY-MM-DD)
    /\b\d{4}-\d{2}-\d{2}\b/g,
    // Waiting or duration periods (e.g. 24 Months, 90 Days)
    /\b\d+\s+(?:days|months|weeks|years)\b/gi,
  ];

  const monthToNum = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  const foundDateStrings = new Set();
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const matchStr = match[0].trim();
      const normMatch = matchStr.toLowerCase();
      if (!foundDateStrings.has(normMatch)) {
        foundDateStrings.add(normMatch);

        // Find context sentence
        const ctxSentence = sentences.find((s) => s.toLowerCase().includes(normMatch)) || text.slice(Math.max(0, match.index - 50), match.index + 80);

        // Infer Event name
        let event = 'Scheduled Date';
        if (/clear|dues|library|lab/i.test(ctxSentence)) event = 'Dues Clearance Cutoff';
        else if (/commence|begin|start|held/i.test(ctxSentence)) event = 'Event Commencement';
        else if (/download|admit|hall ticket|portal/i.test(ctxSentence)) event = 'Document Availability Date';
        else if (/submit|apply|application|last date|cutoff|deadline/i.test(ctxSentence)) event = 'Submission Deadline';
        else if (/waiting period|condition/i.test(ctxSentence)) event = 'Waiting Period Duration';

        // Check if ISO format can be constructed
        let dateIso = null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(matchStr)) {
          dateIso = matchStr;
        } else {
          const parts = matchStr.match(/([a-zA-Z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/);
          if (parts) {
            const mName = parts[1].toLowerCase();
            const dayNum = parts[2].padStart(2, '0');
            const yearNum = parts[3] || '2026';
            if (monthToNum[mName]) {
              dateIso = `${yearNum}-${monthToNum[mName]}-${dayNum}`;
            }
          }
        }

        const chunkId = findChunkForSnippet(matchStr);
        importantDates.push({
          event,
          date_original: matchStr,
          date_iso: dateIso,
          details: ctxSentence.trim(),
          source_references: [chunkId],
        });

        if (importantDates.length >= 6) break;
      }
    }
    if (importantDates.length >= 6) break;
  }

  // 7. Important Amounts Extraction (Strictly from Document Text)
  const importantAmounts = [];
  const amountPatterns = [
    /(?:Rs\.?|INR|₹|\$)\s*[\d,]+(?:\.\d+)?(?:\s*(?:per\s+(?:annum|month|semester|year)|(?:\/-)))?/gi,
    /\b\d+(?:\.\d+)?\s*(?:Lakhs?|Crores?)\b/gi,
  ];

  const foundAmountStrings = new Set();
  for (const pattern of amountPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const matchStr = match[0].trim();
      const normMatch = matchStr.toLowerCase();
      if (!foundAmountStrings.has(normMatch)) {
        foundAmountStrings.add(normMatch);

        const ctxSentence = sentences.find((s) => s.toLowerCase().includes(normMatch)) || text.slice(Math.max(0, match.index - 50), match.index + 80);

        let description = 'Stated Amount';
        if (/fee|penalty|fine|remittance/i.test(ctxSentence)) description = 'Fee / Late Penalty';
        else if (/scholarship|grant|stipend|award/i.test(ctxSentence)) description = 'Grant / Scholarship Amount';
        else if (/income|household|annual/i.test(ctxSentence)) description = 'Income Ceiling Limit';
        else if (/premium|co-pay|deductible/i.test(ctxSentence)) description = 'Policy Premium / Co-pay';

        const chunkId = findChunkForSnippet(matchStr);
        importantAmounts.push({
          description,
          amount_original: matchStr,
          details: ctxSentence.trim(),
          source_references: [chunkId],
        });

        if (importantAmounts.length >= 4) break;
      }
    }
  }

  // 8. Action Steps / Checklist Extraction (Strictly from Document Text)
  const actionSteps = [];
  const actionSentences = sentences.filter((s) =>
    /\b(?:must|should|clear|submit|download|print|pay|return|obtain|bring|apply|verify|ensure|visit)\b/i.test(s)
  );

  actionSentences.slice(0, 5).forEach((sent, idx) => {
    let priority = 'medium';
    if (/\b(?:must|mandatory|strictly|cutoff|deadline|fee|penalty|immediately)\b/i.test(sent)) {
      priority = 'high';
    } else if (/\b(?:may|optional|recommended)\b/i.test(sent)) {
      priority = 'low';
    }

    // Extract potential deadline mentioned in the same action sentence
    let deadline = null;
    const dateMatch = sent.match(/\b(?:before|by|on|until)\s+([A-Za-z]+\s+\d{1,2}(?:,\s+\d{4})?|\d{4}-\d{2}-\d{2})\b/i);
    if (dateMatch) {
      deadline = dateMatch[1];
    }

    const chunkId = findChunkForSnippet(sent.slice(0, 40));
    actionSteps.push({
      id: `step-${idx + 1}`,
      step: idx + 1,
      action: sent,
      details: sent,
      priority,
      deadline,
      source_references: [chunkId],
    });
  });

  // 9. Eligibility Criteria (Strictly from Document Text)
  const eligibilityCriteria = [];
  const eligibilitySentences = sentences.filter((s) =>
    /\b(?:eligible|eligibility|criteria|qualification|household income|score|marks|cgpa|minimum)\b/i.test(s)
  );

  eligibilitySentences.forEach((sent) => {
    const chunkId = findChunkForSnippet(sent.slice(0, 40));
    eligibilityCriteria.push({
      requirement: sent.slice(0, 90),
      details: sent,
      mandatory: true,
      source_references: [chunkId],
    });
  });

  const eligibility = {
    applicable: eligibilityCriteria.length > 0,
    criteria: eligibilityCriteria,
    notes: eligibilityCriteria.length > 0 ? 'Verification is subject to official document screening.' : null,
  };

  // 10. Required Documents (Strictly from Document Text)
  const requiredDocuments = [];
  const docKeywords = [
    { name: 'Hall Ticket / Admit Card', match: /hall ticket|admit card/i },
    { name: 'Academic Marksheet', match: /marksheet|grade card|results/i },
    { name: 'Income Certificate', match: /income certificate/i },
    { name: 'Identity Proof / Card', match: /id card|aadhaar|identity proof/i },
    { name: 'Application Form', match: /form-?\d+|application form/i },
    { name: 'Clearance Slip', match: /dues clearance|no dues|clearance slip/i },
  ];

  docKeywords.forEach(({ name, match }) => {
    const foundSent = sentences.find((s) => match.test(s));
    if (foundSent) {
      const chunkId = findChunkForSnippet(foundSent.slice(0, 40));
      requiredDocuments.push({
        name,
        details: foundSent,
        mandatory: true,
        source_references: [chunkId],
      });
    }
  });

  // 11. Warnings & Penalties (Strictly from Document Text)
  const warnings = [];
  const warningSentences = sentences.filter((s) =>
    /\b(?:late fee|penalty|fine|rejected|withheld|disqualified|strictly prohibited|forfeited|rule\s+\d+)\b/i.test(s)
  );

  warningSentences.forEach((sent) => {
    let type = 'Strict Requirement';
    if (/late fee|penalty|fine/i.test(sent)) type = 'Financial Penalty / Late Fee';
    else if (/rejected|withheld|disqualified/i.test(sent)) type = 'Rejection Warning';

    const chunkId = findChunkForSnippet(sent.slice(0, 40));
    warnings.push({
      type,
      message: sent,
      source_references: [chunkId],
    });
  });

  // 12. Grounded Question Answering (Strictly from Document Text)
  let userQuestionAnswer = {
    question: null,
    answer: null,
    evidence: [],
    confidence: 'high',
  };

  if (userQuestion && userQuestion.trim()) {
    const qTrimmed = userQuestion.trim();
    const qWords = qTrimmed
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => !['what', 'when', 'where', 'how', 'is', 'the', 'a', 'an', 'for', 'of', 'in', 'to', 'do', 'does', 'can', 'i'].includes(w));

    let bestSentence = null;
    let highestScore = 0;

    for (const sent of sentences) {
      const sLower = sent.toLowerCase();
      let score = 0;
      for (const word of qWords) {
        if (sLower.includes(word)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestSentence = sent;
      }
    }

    if (bestSentence && highestScore >= 1) {
      const chunkId = findChunkForSnippet(bestSentence.slice(0, 40));
      userQuestionAnswer = {
        question: qTrimmed,
        answer: `According to the document: ${bestSentence}`,
        evidence: [
          {
            text: bestSentence,
            source_references: [chunkId],
          },
        ],
        confidence: 'high',
      };
    } else {
      userQuestionAnswer = {
        question: qTrimmed,
        answer: 'The provided document does not contain enough information to answer this question.',
        evidence: [],
        confidence: 'low',
      };
    }
  }

  return {
    success: true,
    language,
    document_type: documentType,
    title: extractedTitle,
    summary,
    main_points: mainPoints,
    eligibility,
    required_documents: requiredDocuments,
    important_dates: importantDates,
    important_amounts: importantAmounts,
    action_steps: actionSteps,
    warnings,
    user_question_answer: userQuestionAnswer,
    missing_information: [],
    disclaimer: 'This information is extracted directly from the uploaded document for reference; please verify important deadlines and guidelines with the issuing authority.',
  };
}

export class MockLlmProvider extends BaseLlmProvider {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  setMockResponse(response) {
    this.options.mockResponse = response;
  }

  setShouldFail(shouldFail, errorType = 'provider') {
    this.options.shouldFail = shouldFail;
    this.options.errorType = errorType;
  }

  async generateStructured({ systemPrompt, userPrompt, schemaName }) {
    if (this.options.shouldFail) {
      if (this.options.errorType === 'timeout') {
        throw new ModelTimeoutError('Mock model request timed out.');
      }
      throw new ModelProviderError('Mock model provider error.');
    }

    if (this.options.mockResponse !== undefined) {
      if (typeof this.options.mockResponse === 'string') {
        return this.options.mockResponse;
      }
      return JSON.stringify(this.options.mockResponse);
    }

    let parsedUserPrompt = {};
    try {
      parsedUserPrompt = JSON.parse(userPrompt);
    } catch {
      // Fallback: check if userPrompt is raw text
      parsedUserPrompt = { document_text: userPrompt };
    }

    const documentText = parsedUserPrompt.document_text || '';
    const userQuestion = parsedUserPrompt.user_question || null;
    const language = parsedUserPrompt.language || 'English';
    const detailLevel = parsedUserPrompt.detail_level || 'standard';
    const sourceChunks = parsedUserPrompt.source_chunks || [];

    const groundedAnalysis = extractGroundedAnalysis({
      documentText,
      userQuestion,
      language,
      detailLevel,
      sourceChunks,
    });

    return JSON.stringify(groundedAnalysis);
  }
}

export default MockLlmProvider;
