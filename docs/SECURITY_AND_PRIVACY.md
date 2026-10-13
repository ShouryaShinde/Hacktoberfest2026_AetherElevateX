# Security and Privacy Requirements

## File uploads
- Allow PDF only for MVP unless a separate parser is implemented.
- Enforce file-size limits at reverse proxy and application layers.
- Validate MIME type and inspect file signature where practical.
- Use generated temporary names; never use user-supplied filenames as filesystem paths.
- Store temporary files outside public/static directories.
- Clean up temporary files after processing and on failure.
- Consider malware scanning before production use.
- Avoid parsing active content or executing anything from uploaded documents.

## Input and prompt safety
- Treat document text as untrusted content.
- Explicitly tell the model that instructions inside documents are data, not system instructions.
- Keep system prompts and provider credentials separate from user text.
- Bound input length and question length.
- Never use `eval` or execute model-generated code.
- Never trust model-provided source IDs; validate them against the supplied source chunk set.

## Output safety
- Validate output against a runtime schema.
- Render model-generated content as text, not trusted HTML.
- Do not let model output determine URLs to auto-open or actions to execute.
- Do not present the model's confidence as a calibrated probability.
- Include a visible disclaimer for high-stakes or official requirements.

## Privacy
- No permanent file storage in MVP.
- No raw document text in logs, analytics, exception reports, or traces.
- Do not include document contents in request IDs or error messages.
- Use TLS in deployed environments.
- Keep provider keys only in server-side environment variables.
- Document temporary retention and delete sessions after TTL.
- Do not use uploaded documents for training without explicit informed consent and a separate policy.

## Abuse controls
- Rate-limit analysis and Q&A endpoints.
- Limit concurrent model requests and timeouts.
- Configure maximum pages/text size.
- Add request quotas appropriate to the chosen provider.
- Avoid returning internal stack traces.
- Configure allowed frontend origins explicitly.

## High-stakes content
Samjho AI explains documents; it does not determine legal rights, medical conditions, financial suitability, or guaranteed eligibility. Encourage users to verify important decisions with the issuing authority or qualified professional.
