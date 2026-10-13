# API Contract

Base path: `/api/v1`

All responses are JSON. Use a consistent error envelope. Do not return stack traces to clients.

## 1. `POST /documents/analyze`
Accept `multipart/form-data` with:
- `file`: optional PDF file; exactly one of `file` or `documentText` must be provided.
- `documentText`: optional pasted text field.
- `language`: `English` | `Hindi` | `Marathi` (extensible).
- `detailLevel`: `simple` | `standard` | `detailed`.

Recommended initial maximum PDF size: 10 MB, configurable. Enforce both file size and extracted-text length.

Success `200`:
```json
{
  "success": true,
  "analysisId": "opaque-temporary-id",
  "data": {
    "success": true,
    "language": "English",
    "document_type": "College Notice",
    "title": "Example title",
    "summary": "Plain-language summary.",
    "main_points": [],
    "eligibility": {
      "applicable": null,
      "criteria": [],
      "notes": null
    },
    "required_documents": [],
    "important_dates": [],
    "important_amounts": [],
    "action_steps": [],
    "warnings": [],
    "user_question_answer": {
      "question": null,
      "answer": null,
      "evidence": [],
      "confidence": "low"
    },
    "missing_information": [],
    "disclaimer": null
  }
}
```
The sample is illustrative; the server must validate the complete schema defined in `AI_PIPELINE.md`.

## 2. `POST /documents/:analysisId/questions`
JSON body:
```json
{
  "question": "What is the last date to apply?",
  "language": "English"
}
```
Success `200`:
```json
{
  "success": true,
  "data": {
    "question": "What is the last date to apply?",
    "answer": "The document states ...",
    "evidence": [
      {
        "text": "Relevant exact or faithfully excerpted passage",
        "source_reference": "Page 2, Deadline section"
      }
    ],
    "confidence": "high",
    "warnings": []
  }
}
```
The API must verify that the analysis ID belongs to an unexpired temporary session. Never accept arbitrary `analysisId` values as authorization.

## 3. `GET /health`
Success:
```json
{
  "success": true,
  "status": "ok"
}
```
Do not expose environment variables or provider details in public health responses.

## 4. Error envelope
```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "Please upload a PDF file or paste document text.",
    "requestId": "request-id"
  }
}
```

Suggested error codes:
- `VALIDATION_ERROR` — 400
- `UNSUPPORTED_FILE_TYPE` — 415
- `FILE_TOO_LARGE` — 413
- `EMPTY_DOCUMENT` — 422
- `TEXT_EXTRACTION_FAILED` — 422
- `ANALYSIS_NOT_FOUND` — 404
- `ANALYSIS_EXPIRED` — 410
- `RATE_LIMITED` — 429
- `MODEL_PROVIDER_ERROR` — 502
- `MODEL_TIMEOUT` — 504
- `INVALID_MODEL_OUTPUT` — 502
- `INTERNAL_ERROR` — 500

## 5. API rules
- Validate content type, file signature where practical, file size, and extracted-text size.
- Use timeouts and bounded retries only for retryable provider failures.
- Do not retry indefinitely.
- Include a request ID for debugging.
- Do not include raw document text or secrets in error messages.
- Add CORS allow-list configuration for the deployed frontend origin.
- Use rate limiting on analysis and question endpoints.
