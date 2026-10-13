# Samjho AI — Antigravity Context Pack

This archive contains the context and implementation documents for building Samjho AI with Antigravity.

## Start here
1. Extract the archive into the root of your repository.
2. Keep `AGENTS.md` at the repository root.
3. Keep the `docs/` directory at the repository root.
4. Ask Antigravity to read `AGENTS.md` and `docs/README.md`.
5. Tell it to inspect the existing repository and implement **Phase 0 only** from `docs/IMPLEMENTATION_PLAN.md`.
6. Review the changes before moving to Phase 1.

## Suggested first Antigravity prompt
“Read `AGENTS.md` and all documents referenced by it. Inspect the current repository and report its existing stack, structure, and gaps against the documentation. Do not implement features yet. Then implement Phase 0 only from `docs/IMPLEMENTATION_PLAN.md`, preserving existing working code. Run the available checks and summarize the result.”

## Key decisions
- React + Vite + TypeScript + Tailwind + shadcn/ui frontend.
- Node.js + Express + TypeScript backend.
- MVC/service/provider separation.
- Gemma 4 behind a provider adapter.
- Stable JSON schema validated server-side.
- PDF/pasted text first; OCR later.
- Temporary document processing; no permanent storage in MVP.
- Grounded Q&A with validated source chunk references.
