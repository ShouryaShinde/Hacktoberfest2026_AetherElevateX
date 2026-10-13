import { BaseLlmProvider } from '../base.provider.js';
import { ModelProviderError, ModelTimeoutError } from '../../utils/errors.js';

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
      // ignore
    }

    const language = parsedUserPrompt.language || 'English';
    const sourceChunks = parsedUserPrompt.source_chunks || [];
    const firstChunkId = sourceChunks[0]?.chunk_id || 'p1-c1';

    const defaultAnalysis = {
      success: true,
      language,
      document_type: 'College Notice',
      title: 'Annual Merit Scholarship Application Notice',
      summary: 'This official notice announces the application timeline and eligibility criteria for college scholarships for the academic year.',
      main_points: [
        {
          heading: 'Application Window Open',
          explanation: 'Eligible candidates must complete online applications before the specified deadline.',
          source_references: [firstChunkId],
        },
      ],
      eligibility: {
        applicable: true,
        criteria: [
          {
            requirement: 'Minimum academic score of 75%',
            details: 'Students must have secured at least 75% marks in the preceding academic session.',
            mandatory: true,
            source_references: [firstChunkId],
          },
        ],
        notes: 'Verification is subject to institutional screening.',
      },
      required_documents: [
        {
          name: 'Academic Marksheet',
          details: 'Attested copy of previous semester results.',
          mandatory: true,
          source_references: [firstChunkId],
        },
      ],
      important_dates: [
        {
          event: 'Application Deadline',
          date_original: 'November 15, 2026',
          date_iso: '2026-11-15',
          details: 'Applications submitted after 5:00 PM will not be evaluated.',
          source_references: [firstChunkId],
        },
      ],
      important_amounts: [
        {
          description: 'Scholarship Grant',
          amount_original: '₹25,000 per annum',
          details: 'Disbursed directly into registered student bank accounts.',
          source_references: [firstChunkId],
        },
      ],
      action_steps: [
        {
          id: 'step-1',
          step: 1,
          action: 'Collect attested documents and submit via online portal.',
          details: 'Keep scanned copies under 2 MB.',
          priority: 'high',
          deadline: '2026-11-15',
          source_references: [firstChunkId],
        },
      ],
      warnings: [
        {
          type: 'Strict Deadline',
          message: 'Incomplete applications or submissions past the deadline will be rejected.',
          source_references: [firstChunkId],
        },
      ],
      user_question_answer: {
        question: parsedUserPrompt.user_question || null,
        answer: parsedUserPrompt.user_question
          ? 'The document specifies that applications must be submitted before November 15, 2026.'
          : null,
        evidence: parsedUserPrompt.user_question
          ? [
              {
                text: 'Applications must be submitted before November 15, 2026.',
                source_references: [firstChunkId],
              },
            ]
          : [],
        confidence: 'high',
      },
      missing_information: [],
      disclaimer: 'This information is extracted for reference; verify details with the official university portal.',
    };

    return JSON.stringify(defaultAnalysis);
  }
}

export default MockLlmProvider;
