# Product Requirements Document (PRD)

## 1. Product summary
Samjho AI turns difficult documents into plain-language explanations and actionable checklists. It is designed for people who need to understand notices, circulars, scholarship announcements, forms, and public information without reading dense official language repeatedly.

**Tagline:** Understand the information. Know what to do next.

## 2. Problem
Documents often bury the useful details: who qualifies, what to submit, deadlines, amounts, and next steps. Users may misunderstand complex language or miss requirements. Generic chat interfaces do not reliably present these details in a consistent, scannable format.

## 3. Initial users
- College students reading circulars, scholarship notices, exam announcements, and fee notices.
- Parents and caregivers helping students with paperwork.
- People trying to understand public notices and application instructions.

## 4. MVP journey
1. User pastes text or uploads a PDF.
2. App validates the input and extracts text.
3. User chooses output language and detail level.
4. Backend sends document text and instructions to the configured Gemma 4 inference provider.
5. Backend parses and validates model output against a schema.
6. Frontend renders summary, key points, checklists, dates, amounts, warnings, and evidence.
7. User asks a follow-up question; the answer is grounded in the same document text.
8. User can copy the summary/checklist. No document is stored permanently by default.

## 5. Functional requirements
### P0 — must have
- Upload one PDF or paste text.
- File validation: PDF only in MVP, configurable size limit, reject empty/unsupported files.
- Show upload, extraction, analysis, and error states.
- Language selector: English, Hindi, Marathi as initial options; model performance must be tested for each.
- Detail selector: simple, standard, detailed.
- Structured JSON response validated on the server.
- Render summary, main points, eligibility, required documents, dates, amounts, action steps, warnings, missing information.
- Follow-up Q&A with evidence/source references where available.
- Copy summary and checklist.
- Clear messages for unreadable PDFs, unsupported files, model errors, and invalid model output.
- Responsive and keyboard-accessible interface.

### P1 — after MVP works
- OCR for scanned PDFs and images.
- Downloadable summary as PDF.
- Better page-level source citations.
- Optional user accounts and saved documents, only after privacy/retention decisions.
- More languages based on evaluation results.

## 6. Non-functional requirements
- Never expose model credentials in browser bundles.
- Validate all inputs and outputs.
- Use request timeouts and bounded retries.
- Limit file size and extracted text length.
- Do not log raw document content by default.
- Avoid unsupported claims; missing facts should remain unknown.
- Keep model-provider integration replaceable.
- Aim for useful responses within a reasonable wait time; measure latency rather than promise a fixed number.
- Handle small screens and common accessibility requirements.

## 7. Success metrics
Track privacy-safe aggregate metrics:
- Analysis completion rate.
- Successful extraction rate.
- Percentage of outputs passing JSON schema validation.
- Percentage of questions answered with supporting evidence.
- User-rated usefulness.
- Error rate by stage: upload, extraction, inference, validation.
Do not collect document contents for analytics.

## 8. Out of scope
- Legal, medical, or financial advice.
- Guaranteeing scholarship eligibility or application approval.
- Auto-filling/submitting official applications.
- General web search unless added as a separate, source-verified feature.
- Training a foundation model from scratch.

## 9. Risks and mitigations
- **Hallucination:** Ground answers in supplied text, show evidence, state unknowns.
- **Prompt injection in documents:** Treat document text as data; never follow embedded instructions.
- **Bad PDF extraction:** Detect very short/empty extraction and explain the limitation.
- **Model output not valid JSON:** Use schema validation and one controlled repair attempt if safe; otherwise return a typed error.
- **Privacy concerns:** No persistent uploads by default, no raw-content logs, clear deletion/retention behavior.
