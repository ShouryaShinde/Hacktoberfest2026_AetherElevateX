# Samjho AI Documentation Index

This folder is the implementation source of truth for Antigravity and contributors.

| Document | Purpose |
|---|---|
| `PRD.md` | Problem, users, scope, requirements, success criteria |
| `ARCHITECTURE.md` | Monorepo structure, modules, request flow, technology decisions |
| `API_CONTRACT.md` | HTTP endpoints, request/response formats, error envelope |
| `AI_PIPELINE.md` | Gemma prompt, JSON schema, grounding and validation |
| `DATABASE.md` | MVP persistence decisions and future schema |
| `UI_UX.md` | Screens, component requirements, interaction states |
| `IMPLEMENTATION_PLAN.md` | Phased build plan and acceptance criteria |
| `SECURITY_AND_PRIVACY.md` | Upload security, privacy, prompt injection, retention |
| `TESTING.md` | Unit, integration, and end-to-end test plan |
| `ENVIRONMENT.md` | Environment variables and local setup |

## Product principles
1. Clarity over complexity.
2. Document-grounded answers over confident guesses.
3. Make next actions obvious.
4. Keep user documents private by default.
5. Every generated section must be easy for the frontend to render.
6. Use a consistent, versioned JSON contract.

## MVP boundaries
- Supported input: pasted text and text-based PDF.
- Optional next step: OCR for scanned PDFs/images.
- Primary outputs: summary, main points, eligibility, required documents, important dates and amounts, action checklist, warnings, follow-up Q&A with evidence.
- No user accounts or long-term document library in the first iteration.
- No automatic submission of forms or applications.
