# Implementation Plan for Antigravity

Build in small phases. At the end of each phase, run typecheck, lint, and tests.

## Phase 0 — Repository inspection and baseline
- Inspect repository, package manager, current framework, and existing code.
- Do not overwrite working code.
- Write down the current structure and identify missing parts.
- Add/update root README and confirm the app runs.

**Acceptance:** Current app runs or a precise blocker is documented.

## Phase 1 — UI shell and mock data
- Build responsive landing/workspace and result sections.
- Implement upload/paste UI, language/detail selectors, loading/error states.
- Create a typed mock analysis response matching `AI_PIPELINE.md`.
- Render the mock response through reusable components.

**Acceptance:** User can see the full intended workflow with mock data; mobile layout works; no model integration yet.

## Phase 2 — API foundation
- Create Express app, health endpoint, request ID middleware, CORS, centralized errors, rate limiting.
- Add request/file validation and documented error envelope.
- Add PDF extraction service and pasted-text path.
- Enforce size and extracted-text limits.

**Acceptance:** Valid PDF/text is accepted; invalid file, empty text, too-large input, and extraction errors return stable JSON errors.

## Phase 3 — Gemma provider adapter
- Implement provider abstraction and configured Gemma adapter.
- Store prompt as a versioned source file.
- Add timeout and bounded retry.
- Parse JSON and validate with Zod.
- Add mocked provider for tests.

**Acceptance:** API returns schema-valid structured data with mock provider; real provider works in development with server-side credentials; malformed model output fails safely.

## Phase 4 — End-to-end analysis
- Connect React form to `POST /api/v1/documents/analyze`.
- Render actual analysis data.
- Add copy summary/checklist.
- Ensure loading and error states are usable.

**Acceptance:** User can upload/paste a document and see the validated result in the UI.

## Phase 5 — Grounded follow-up questions
- Add temporary analysis sessions with expiry.
- Chunk extracted text with stable chunk IDs and page/section metadata where available.
- Select relevant chunks for questions.
- Validate source references returned by model.
- Return answer, evidence, confidence label, and warnings.

**Acceptance:** Supported answers show source evidence; unanswerable questions explicitly say the document does not specify the answer; expired session returns 410.

## Phase 6 — Quality, security, and deployment
- Add evaluation fixtures and tests.
- Test prompt injection, malformed PDFs, long text, unsupported languages, conflicting dates, and provider failures.
- Configure production environment variables, CORS, file limits, request timeouts, and logging redaction.
- Deploy web/API separately if required.
- Document deployment and retention behavior.

**Acceptance:** Build, typecheck, lint, and tests pass; no secrets are committed; README explains setup and known limitations.

## Agent work protocol
At the start of each phase:
1. State the planned changes briefly.
2. Inspect relevant files.
3. Implement only that phase.
4. Run checks and tests.
5. Summarize changed files, verification results, and unresolved issues.
Do not move to the next phase if the current phase has failing checks without documenting why.
