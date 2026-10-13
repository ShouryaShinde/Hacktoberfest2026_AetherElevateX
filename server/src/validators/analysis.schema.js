import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const MainPointSchema = z.object({
  heading: z.string().default('Key Point'),
  explanation: z.string().default(''),
  source_references: z.array(z.string()).default([]),
});

export const EligibilityCriteriaSchema = z.object({
  requirement: z.string(),
  details: z.string().default(''),
  mandatory: z.boolean().nullable().nullish().default(true),
  source_references: z.array(z.string()).default([]),
});

export const EligibilitySchema = z.object({
  applicable: z.boolean().nullable().nullish().default(false),
  criteria: z.array(EligibilityCriteriaSchema).default([]),
  notes: z.string().nullable().nullish().default(null),
});

export const RequiredDocumentSchema = z.object({
  name: z.string(),
  details: z.string().nullable().nullish().default(null),
  mandatory: z.boolean().nullable().nullish().default(true),
  source_references: z.array(z.string()).default([]),
});

export const ImportantDateSchema = z.object({
  event: z.string().default('Important Date'),
  date_original: z.string().default(''),
  date_iso: z.string().regex(isoDateRegex, 'date_iso must be in YYYY-MM-DD format').nullable().nullish().default(null),
  details: z.string().nullable().nullish().default(null),
  source_references: z.array(z.string()).default([]),
});

export const ImportantAmountSchema = z.object({
  description: z.string().default('Fee / Amount'),
  amount_original: z.string().default(''),
  details: z.string().nullable().nullish().default(null),
  source_references: z.array(z.string()).default([]),
});

export const ActionStepSchema = z.object({
  id: z.string().default('step-1'),
  step: z.number().default(1),
  action: z.string().default(''),
  details: z.string().nullable().nullish().default(null),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  deadline: z.string().nullable().nullish().default(null),
  source_references: z.array(z.string()).default([]),
});

export const WarningSchema = z.object({
  type: z.string().default('Notice'),
  message: z.string().default(''),
  source_references: z.array(z.string()).default([]),
});

export const QuestionEvidenceSchema = z.object({
  text: z.string().default(''),
  source_references: z.array(z.string()).default([]),
});

export const UserQuestionAnswerSchema = z.object({
  question: z.string().nullable().nullish().default(null),
  answer: z.string().nullable().nullish().default(null),
  evidence: z.array(QuestionEvidenceSchema).default([]),
  confidence: z.enum(['high', 'medium', 'low']).default('low'),
});

export const DocumentAnalysisSchema = z.object({
  success: z.boolean().default(true),
  language: z.string().default('English'),
  document_type: z.string().nullable().nullish().default('Document'),
  title: z.string().nullable().nullish().default(null),
  summary: z.string().default(''),
  main_points: z.array(MainPointSchema).default([]),
  eligibility: EligibilitySchema.default({ applicable: false, criteria: [], notes: null }),
  required_documents: z.array(RequiredDocumentSchema).default([]),
  important_dates: z.array(ImportantDateSchema).default([]),
  important_amounts: z.array(ImportantAmountSchema).default([]),
  action_steps: z.array(ActionStepSchema).default([]),
  warnings: z.array(WarningSchema).default([]),
  user_question_answer: UserQuestionAnswerSchema.default({ question: null, answer: null, evidence: [], confidence: 'low' }),
  missing_information: z.array(z.string()).default([]),
  disclaimer: z.string().nullable().nullish().default(null),
});

export default DocumentAnalysisSchema;

