# Environment and Local Development

## Environment variables
Use `.env.example` with placeholders only. Never commit `.env`.

API:
```dotenv
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=10
MAX_EXTRACTED_CHARS=100000
ANALYSIS_SESSION_TTL_MINUTES=60
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Choose one provider/runtime and configure only its required values.
GEMMA_PROVIDER=hosted
GEMMA_MODEL_ID=
GEMMA_BASE_URL=
GEMMA_API_KEY=
GEMMA_TIMEOUT_MS=60000
```

Do not assume a generic hosted provider supports a universal endpoint. Implement the provider adapter for the selected service and document its exact required variables. If using a local runtime, use a local base URL and no API key where appropriate.

Web:
```dotenv
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Only variables prefixed with `VITE_` are exposed to the frontend. Never put provider secrets in `VITE_*` variables.

## Local setup
The coding agent must adapt commands to the actual package manager and repository. The intended sequence is:
1. Install dependencies.
2. Copy `.env.example` to `.env` in the API app and configure inference.
3. Start the API.
4. Start the web app.
5. Visit the local Vite URL.
6. Run lint, typecheck, and tests.

## Deployment checks
- Set `WEB_ORIGIN` to the actual frontend origin.
- Set `VITE_API_BASE_URL` to the deployed API base URL at web build time.
- Configure provider credentials in the API host only.
- Verify upload/body limits at the host/proxy.
- Verify provider timeout behavior.
- Confirm temporary content expiry works in the deployed environment.
- Confirm no secret appears in frontend build output or logs.
