# Data and Persistence

## MVP recommendation
Do not persist uploaded files or document text in a permanent database initially. Keep the first release privacy-minimal. Use a short-lived in-memory store only for local development, or a TTL-backed store suitable for the deployed environment. In-memory sessions disappear on restart and do not work reliably across multiple API instances; document this limitation.

## Temporary analysis record
A future TTL-backed session may contain:
- `analysisId`: random opaque identifier, not sequential.
- `createdAt`, `expiresAt`.
- `language`, `detailLevel`.
- `extractedText` or chunk references.
- `sourceChunks`: chunk ID, page number, section label, text.
- `analysisJson`: validated structured result.
- `fileMetadata`: safe metadata only, never a public path.
Do not store the original PDF unless required by a later explicit product decision.

## PostgreSQL later
If saved history/accounts are introduced, use PostgreSQL. Candidate tables:
- `users`: id, email or identity-provider subject, created_at.
- `documents`: id, user_id, original_filename, mime_type, size_bytes, created_at, expires_at, status.
- `document_chunks`: id, document_id, chunk_index, page_number, section_label, content, embedding (optional pgvector).
- `analyses`: id, document_id, schema_version, model_id, language, result_jsonb, created_at.
- `questions`: id, analysis_id, question, answer_jsonb, created_at.
Use row-level authorization in application logic; consider database row-level security where appropriate. Never expose one user's document to another user.

## Retention
- Define session TTL in configuration.
- Delete temporary text/chunks when the session expires.
- Avoid raw document text in application logs, error monitoring, or analytics.
- Provide a clear user-facing statement of how long temporary content is retained.
