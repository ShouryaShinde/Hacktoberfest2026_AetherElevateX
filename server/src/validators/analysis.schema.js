import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const MainPointSchema = z.object({
  heading: z.string(),
  explanation: z.string(),
  source_references: z.array(z.string()).default([]),
});

export const EligibilityCriteriaSchema = z.object({
  requirement: z.string(),
  details: z.string(),
  mandatory: z.boolean().nullable(),
  source_references: z.array(z.string()).default([]),
});

export const EligibilitySchema = z.object({
  applicable: z.boolean().nullable(),
  criteria: z.array(EligibilityCriteriaSchema).default([]),
  notes: z.string().nullable(),
});

export const RequiredDocumentSchema = z.object({
  name: z.string(),
  details: z.string().nullable(),
  mandatory: z.boolean().nullable(),
  source_references: z.array(z.string()).default([]),
});

export const ImportantDateSchema = z.object({
  event: z.string(),
  date_original: z.string(),
  date_iso: z.string().regex(isoDateRegex, 'date_iso must be in YYYY-MM-DD format').nullable(),
  details: z.string().nullable(),
  source_references: z.array(z.string()).default([]),
});

export const ImportantAmountSchema = z.object({
  description: z.string(),
  amount_original: z.string(),
  details: z.string().nullable(),
  source_references: z.array(z.string()).default([]),
});

export const ActionStepSchema = z.object({
  id: z.string(),
  step: z.number(),
  action: z.string(),
  details: z.string().nullable(),
  priority: z.enum(['high', 'medium', 'low']),
  deadline: z.string().nullable(),
  source_references: z.array(z.string()).default([]),
});

export const WarningSchema = z.object({
  type: z.string(),
  message: z.string(),
  source_references: z.array(z.string()).default([]),
});

export const QuestionEvidenceSchema = z.object({
  text: z.string(),
  source_references: z.array(z.string()).default([]),
});

export const UserQuestionAnswerSchema = z.object({
  question: z.string().nullable(),
  answer: z.string().nullable(),
  evidence: z.array(QuestionEvidenceSchema).default([]),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const DocumentAnalysisSchema = z.object({
  success: z.boolean(),
  language: z.string(),
  document_type: z.string().nullable(),
  title: z.string().nullable(),
  summary: z.string(),
  main_points: z.array(MainPointSchema).default([]),
  eligibility: EligibilitySchema,
  required_documents: z.array(RequiredDocumentSchema).default([]),
  important_dates: z.array(ImportantDateSchema).default([]),
  important_amounts: z.array(ImportantAmountSchema).default([]),
  action_steps: z.array(ActionStepSchema).default([]),
  warnings: z.array(WarningSchema).default([]),
  user_question_answer: UserQuestionAnswerSchema,
  missing_information: z.array(z.string()).default([]),
  disclaimer: z.string().nullable(),
});

export default DocumentAnalysisSchema;
