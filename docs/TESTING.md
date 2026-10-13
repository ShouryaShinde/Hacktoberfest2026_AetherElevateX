# Testing Strategy

## Test layers
- Unit tests: validators, text normalization, chunking, date normalization, schema parsing, source-reference verification.
- Integration tests: API routes with mocked PDF extractor and mocked model provider.
- Frontend tests: upload/paste interactions, loading/error states, rendering empty and populated sections.
- End-to-end tests: one complete pasted-text analysis and one PDF analysis using a mocked model.
- Manual evaluation: real model quality against a small curated document set.

## Required fixtures
1. Document with clear title, eligibility, deadline, amount, and required documents.
2. Document with no dates.
3. Document with conflicting deadlines.
4. Document with ambiguous mandatory/optional language.
5. Hindi document.
6. Marathi document.
7. Empty PDF or PDF with no extractable text.
8. Long document with answer on a later page.
9. Document containing malicious prompt-injection instructions.
10. User asks a question not answered by the document.
11. Provider returns invalid JSON.
12. Provider times out or returns 5xx.
13. User uploads unsupported file type.
14. File exceeds size limit.
15. Expired analysis session is queried.

## Quality assertions
- Every successful model result passes schema validation.
- Unknown dates/amounts are not invented.
- Eligibility is not personalized without personal facts.
- Source IDs always resolve to supplied chunks.
- Unanswerable questions are not answered with guesses.
- UI does not crash when arrays are empty or optional fields are null.
- Error responses match the API contract.
- Raw document text and secrets are absent from logs.

## Commands
Antigravity must use the repository's actual package scripts. Add and document `lint`, `typecheck`, and `test` scripts if missing. Do not claim tests passed unless the commands were run and their exit status checked.
