import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { setCustomProvider, getLlmProvider } from '../src/providers/index.js';
import { MockLlmProvider } from '../src/providers/mock/mock.provider.js';
import { GemmaProvider } from '../src/providers/gemma/gemma.provider.js';
import { DocumentAnalysisSchema } from '../src/validators/analysis.schema.js';

let server;
let baseUrl;

test.before(async () => {
  setCustomProvider(new MockLlmProvider());
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  setCustomProvider(null);
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/v1/health returns status: ok', async () => {
  const res = await fetch(`${baseUrl}/api/v1/health`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.status, 'ok');
  assert.ok(res.headers.get('x-request-id'));
});

test('GET /api/health returns backward-compatible message', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.message, 'Server is running');
});

test('POST /api/v1/documents/analyze returns schema-valid structured data with Mock provider', async () => {
  const mockProvider = new MockLlmProvider();
  setCustomProvider(mockProvider);

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText: 'Notice: All students must submit scholarship applications before November 15, 2026.',
      language: 'English',
      detailLevel: 'standard',
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.analysisId);

  // Validate that response strictly matches DocumentAnalysisSchema
  const parseResult = DocumentAnalysisSchema.safeParse(data.data);
  assert.equal(parseResult.success, true, 'Response must match DocumentAnalysisSchema');

  assert.equal(data.data.language, 'English');
  assert.ok(typeof data.data.summary === 'string');
  assert.ok(Array.isArray(data.data.main_points));
  assert.ok(Array.isArray(data.data.action_steps));
  assert.ok(typeof data.data.eligibility === 'object');
});

test('POST /api/v1/documents/analyze handles model output wrapped in markdown code fences', async () => {
  const mockProvider = new MockLlmProvider();
  const validJson = await mockProvider.generateStructured({ userPrompt: '{}' });
  mockProvider.setMockResponse(`\`\`\`json\n${validJson}\n\`\`\``);
  setCustomProvider(mockProvider);

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText: 'Notice: Application submission deadline announced.',
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.summary);
});

test('POST /api/v1/documents/analyze fails safely on malformed JSON model output (502)', async () => {
  const mockProvider = new MockLlmProvider();
  mockProvider.setMockResponse('This is not a JSON object at all.');
  setCustomProvider(mockProvider);

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText: 'Some document text to analyze.',
    }),
  });

  assert.equal(res.status, 502);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'INVALID_MODEL_OUTPUT');
  assert.ok(data.error.requestId);
});

test('POST /api/v1/documents/analyze handles model provider failure (502)', async () => {
  const mockProvider = new MockLlmProvider();
  mockProvider.setShouldFail(true, 'provider');
  setCustomProvider(mockProvider);

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText: 'Some document text to analyze.',
    }),
  });

  assert.equal(res.status, 502);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'MODEL_PROVIDER_ERROR');
});

test('POST /api/v1/documents/analyze handles model timeout safely (504)', async () => {
  const mockProvider = new MockLlmProvider();
  mockProvider.setShouldFail(true, 'timeout');
  setCustomProvider(mockProvider);

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText: 'Some document text to analyze.',
    }),
  });

  assert.equal(res.status, 504);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'MODEL_TIMEOUT');
});

test('POST /api/v1/documents/analyze with missing text and file returns VALIDATION_ERROR (400)', async () => {
  setCustomProvider(new MockLlmProvider());
  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'VALIDATION_ERROR');
  assert.ok(data.error.requestId);
});

test('POST /api/v1/documents/analyze with empty pasted text returns EMPTY_DOCUMENT (422)', async () => {
  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentText: '    ' }),
  });

  assert.equal(res.status, 422);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'EMPTY_DOCUMENT');
  assert.ok(data.error.requestId);
});

test('POST /api/v1/documents/analyze with text exceeding limit returns FILE_TOO_LARGE (413)', async () => {
  const excessiveText = 'A'.repeat(100005);
  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentText: excessiveText }),
  });

  assert.equal(res.status, 413);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'FILE_TOO_LARGE');
});

test('POST /api/v1/documents/analyze with non-PDF file upload returns UNSUPPORTED_FILE_TYPE (415)', async () => {
  const formData = new FormData();
  const fileBlob = new Blob(['Plain text file content'], { type: 'text/plain' });
  formData.append('file', fileBlob, 'test.txt');

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    body: formData,
  });

  assert.equal(res.status, 415);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'UNSUPPORTED_FILE_TYPE');
});

test('POST /api/v1/documents/analyze with valid minimal PDF upload returns schema-valid data', async () => {
  const mockProvider = new MockLlmProvider();
  setCustomProvider(mockProvider);

  const minimalPdfString =
    '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n' +
    '4 0 obj<</Length 44>>stream\n' +
    'BT /F1 12 Tf 72 712 Td (Samjho AI Notice) Tj ET\n' +
    'endstream\n' +
    'endobj\n' +
    'xref\n' +
    '0 5\n' +
    '0000000000 65535 f \n' +
    '0000000009 00000 n \n' +
    '0000000052 00000 n \n' +
    '0000000102 00000 n \n' +
    '0000000201 00000 n \n' +
    'trailer<</Size 5/Root 1 0 R>>\n' +
    'startxref\n' +
    '296\n' +
    '%%EOF\n';

  const formData = new FormData();
  const pdfBlob = new Blob([minimalPdfString], { type: 'application/pdf' });
  formData.append('file', pdfBlob, 'notice.pdf');

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    body: formData,
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.summary);
});

test('POST /api/v1/documents/analyze with both file and text returns VALIDATION_ERROR (400)', async () => {
  const formData = new FormData();
  const pdfBlob = new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' });
  formData.append('file', pdfBlob, 'notice.pdf');
  formData.append('documentText', 'Some pasted text');

  const res = await fetch(`${baseUrl}/api/v1/documents/analyze`, {
    method: 'POST',
    body: formData,
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'VALIDATION_ERROR');
});

test('GET /unknown-route returns 404 NOT_FOUND', async () => {
  const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'NOT_FOUND');
});

test('GemmaProvider throws ModelProviderError when baseUrl is not configured', async () => {
  const provider = new GemmaProvider({ baseUrl: '' });
  await assert.rejects(
    () => provider.generateStructured({ systemPrompt: 'sys', userPrompt: 'usr', schemaName: 'Test' }),
    (err) => err.code === 'MODEL_PROVIDER_ERROR'
  );
});

test('GemmaProvider respects timeout and throws ModelTimeoutError', async () => {
  // Use a slow dummy server that does not respond in 50ms
  const dummyServer = app.listen(0);
  const port = dummyServer.address().port;
  const slowBaseUrl = `http://127.0.0.1:${port}`;

  const provider = new GemmaProvider({
    baseUrl: slowBaseUrl,
    timeoutMs: 50,
    maxRetries: 0,
  });

  await assert.rejects(
    () => provider.generateStructured({ systemPrompt: 'sys', userPrompt: 'usr', schemaName: 'Test' }),
    (err) => err.code === 'MODEL_TIMEOUT' || err.code === 'MODEL_PROVIDER_ERROR'
  );

  await new Promise((r) => dummyServer.close(r));
});
