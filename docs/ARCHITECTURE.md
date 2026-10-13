# Architecture and Repository Structure

## 1. Recommended architecture
Use a TypeScript monorepo with:
- `apps/web`: React + Vite + TypeScript + Tailwind CSS + shadcn/ui.
- `apps/api`: Node.js + Express + TypeScript REST API using MVC/service/repository separation.
- `packages/contracts`: shared request/response types and Zod schemas, if monorepo setup supports it.
- `docs`: product and engineering specifications.

Do not create a separate Python AI service for the first MVP unless the selected inference runtime requires it. Keep Gemma access behind a provider adapter so the provider can be changed without rewriting application logic.

## 2. Suggested tree
```text
samjho-ai/
├── AGENTS.md
├── README.md
├── package.json
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── upload/
│   │   │   │   ├── analysis/
│   │   │   │   └── common/
│   │   │   ├── features/
│   │   │   │   ├── document-analysis/
│   │   │   │   └── question-answering/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   └── main.tsx
│   │   └── ...
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── validators/
│       │   ├── middleware/
│       │   ├── providers/
│       │   │   └── gemma/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       └── ...
├── packages/
│   └── contracts/
└── docs/
```

## 3. Backend responsibility boundaries
- **Routes:** map HTTP method/path to controller.
- **Controllers:** parse validated request data, call services, return response envelope.
- **Services:** orchestrate extraction, analysis, Q&A, and model calls.
- **Repositories:** only needed when persistence is introduced; do not create unused database abstractions.
- **Providers:** encapsulate provider-specific request/response details.
- **Validators:** validate inputs and model output using Zod.
- **Middleware:** request ID, rate limiting, error handling, CORS, upload checks.
- **Config:** read and validate environment variables at startup.

## 4. Analysis request flow
Browser → API validation → PDF/text extraction → extraction-quality check → prompt builder → Gemma provider → JSON parsing → Zod schema validation → normalize source references → API response → React renderer.

## 5. Question-answer flow
Browser sends `documentId` only if a temporary server-side session exists; otherwise send a client-held opaque analysis/session token or the required bounded document context. Do not trust a client-provided answer as evidence. The backend retrieves the stored extracted text for that temporary session, builds a grounded prompt with the question, invokes Gemma, validates the response, and returns answer plus evidence.

For the simplest stateless MVP, the frontend may submit the extracted text again with the question, but enforce request limits and never accept model-generated evidence without checking that it matches the supplied document. Prefer a short-lived server-side session if the document is large.

## 6. Model provider abstraction
Define an interface such as:
```ts
export interface LlmProvider {
  generateStructured(input: {
    systemPrompt: string;
    userPrompt: string;
    schemaName: string;
  }): Promise<string>;
}
```
The provider adapter may use a local runtime or hosted inference API. Exact API fields vary by provider; keep those details in `providers/gemma/` and configuration, not in controllers.

## 7. Deployment
- Web app: static hosting such as Vercel.
- API: Node-compatible hosting with request-body and timeout limits suitable for document analysis.
- Inference: hosted Gemma-compatible endpoint or self-hosted runtime with sufficient memory/compute.
- Keep API and model-provider secrets in server environment variables.
- If hosting limits make long model calls unreliable, introduce a job queue in a later phase.
