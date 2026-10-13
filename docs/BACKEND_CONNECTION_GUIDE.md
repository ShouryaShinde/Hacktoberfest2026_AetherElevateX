# Backend Connection & Integration Guide

This guide is designed for frontend developers to seamlessly connect the React client to the Express backend API.

---

## 1. Quick Start & Environment Configuration

### Frontend Environment Variables (`client/.env`)
Create or update `.env` in the `client/` folder:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

> **Note on CORS:** The backend already allows requests from `http://localhost:5173` and `http://127.0.0.1:5173`. If you run Vite on a different port, update `WEB_ORIGIN` in `server/.env`.

---

## 2. API Endpoints Summary

| Method | Endpoint | Content-Type | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | — | Check server health and connection status |
| `POST` | `/api/v1/documents/analyze` | `multipart/form-data` OR `application/json` | Upload a PDF or submit pasted text for analysis |
| `POST` | `/api/v1/documents/:analysisId/questions` | `application/json` | Ask follow-up questions grounded in the analyzed document *(Phase 5)* |

---

## 3. Endpoint Specifications

### A. Health Check
- **URL:** `GET http://localhost:5000/api/v1/health`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "status": "ok"
  }
  ```

---

### B. Analyze Document (`POST /api/v1/documents/analyze`)

The endpoint supports two input types:
1. **Uploading a PDF File** (`multipart/form-data`)
2. **Pasting Text Directly** (`application/json` or `multipart/form-data`)

> **Validation Rule:** Exactly one of `file` or `documentText` must be provided. Do not send both.

#### Parameters:
| Field | Type | Required? | Values / Constraints |
|---|---|---|---|
| `file` | File (Binary) | Optional | PDF only (`.pdf`), max 10 MB |
| `documentText` | String | Optional | Raw text string, max 100,000 characters |
| `language` | String | Optional | `'English'` (default), `'Hindi'`, `'Marathi'` |
| `detailLevel` | String | Optional | `'simple'`, `'standard'` (default), `'detailed'` |
| `userQuestion` | String | Optional | Optional question to be answered alongside the analysis |

---

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "analysisId": "d8b021d5-78e8-46c5-8f6a-4972f7783a30",
  "data": {
    "success": true,
    "language": "English",
    "document_type": "College Notice",
    "title": "Annual Merit Scholarship Application Notice",
    "summary": "This official notice announces the application timeline and eligibility criteria for scholarships.",
    "main_points": [
      {
        "heading": "Application Window Open",
        "explanation": "Eligible candidates must complete online applications before the specified deadline.",
        "source_references": ["p1-c1"]
      }
    ],
    "eligibility": {
      "applicable": true,
      "criteria": [
        {
          "requirement": "Minimum academic score of 75%",
          "details": "Students must have secured at least 75% marks in the preceding session.",
          "mandatory": true,
          "source_references": ["p1-c1"]
        }
      ],
      "notes": "Verification is subject to institutional screening."
    },
    "required_documents": [
      {
        "name": "Academic Marksheet",
        "details": "Attested copy of previous semester results.",
        "mandatory": true,
        "source_references": ["p1-c1"]
      }
    ],
    "important_dates": [
      {
        "event": "Application Deadline",
        "date_original": "November 15, 2026",
        "date_iso": "2026-11-15",
        "details": "Applications submitted after 5:00 PM will not be evaluated.",
        "source_references": ["p1-c1"]
      }
    ],
    "important_amounts": [
      {
        "description": "Scholarship Grant",
        "amount_original": "₹25,000 per annum",
        "details": "Disbursed directly into registered student bank accounts.",
        "source_references": ["p1-c1"]
      }
    ],
    "action_steps": [
      {
        "id": "step-1",
        "step": 1,
        "action": "Collect attested documents and submit via online portal.",
        "details": "Keep scanned copies under 2 MB.",
        "priority": "high",
        "deadline": "2026-11-15",
        "source_references": ["p1-c1"]
      }
    ],
    "warnings": [
      {
        "type": "Strict Deadline",
        "message": "Incomplete applications will be rejected.",
        "source_references": ["p1-c1"]
      }
    ],
    "user_question_answer": {
      "question": null,
      "answer": null,
      "evidence": [],
      "confidence": "high"
    },
    "missing_information": [],
    "disclaimer": "This information is extracted for reference; verify details with the official university portal."
  }
}
```

---

#### Error Envelope (4xx / 5xx)
All errors return a predictable JSON envelope:

```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "Please upload a PDF file or paste document text.",
    "requestId": "e39ad8d2-4fe9-4e7a-9a99-880945d8b8b0"
  }
}
```

#### Common Error Codes:
- `VALIDATION_ERROR` (`400`): Missing parameters or both file and text were provided.
- `UNSUPPORTED_FILE_TYPE` (`415`): File uploaded is not a valid PDF.
- `FILE_TOO_LARGE` (`413`): File exceeds 10 MB or text exceeds 100,000 characters.
- `EMPTY_DOCUMENT` (`422`): Uploaded PDF or pasted text has no readable text.
- `RATE_LIMITED` (`429`): Too many requests in a short period (window: 60s).
- `MODEL_TIMEOUT` (`504`): AI model took longer than configured timeout.
- `INVALID_MODEL_OUTPUT` (`502`): AI model output failed schema validation.

---

## 4. Frontend Code Examples

### A. API Client Setup (`client/src/services/api.js`)

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Upload a PDF or send pasted text for analysis
 */
export async function analyzeDocument({ file, documentText, language = 'English', detailLevel = 'standard', userQuestion = '' }) {
  let response;

  if (file) {
    // Multipart Form Data for File Upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('detailLevel', detailLevel);
    if (userQuestion) formData.append('userQuestion', userQuestion);

    response = await fetch(`${API_BASE_URL}/documents/analyze`, {
      method: 'POST',
      body: formData,
    });
  } else {
    // JSON Request for Pasted Text
    response = await fetch(`${API_BASE_URL}/documents/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
        language,
        detailLevel,
        userQuestion: userQuestion || null,
      }),
    });
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to analyze document');
  }

  return result; // Contains { success: true, analysisId, data: { ... } }
}

/**
 * Health check
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

### B. React Hook / Component Integration (`client/src/hooks/useDocumentAnalysis.js`)

```javascript
import { useState } from 'react';
import { analyzeDocument } from '../services/api';

export function useDocumentAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  const runAnalysis = async ({ file, documentText, language, detailLevel }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyzeDocument({
        file,
        documentText,
        language,
        detailLevel,
      });

      setAnalysisId(response.analysisId);
      setAnalysis(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setAnalysisId(null);
    setError(null);
  };

  return { runAnalysis, loading, error, analysis, analysisId, reset };
}
```

---

## 5. Testing the Connection Manually

You can test the backend directly using `curl` from terminal:

### 1. Test Health
```bash
curl http://localhost:5000/api/v1/health
```

### 2. Test Pasted Text Analysis
```bash
curl -X POST http://localhost:5000/api/v1/documents/analyze \
  -H "Content-Type: application/json" \
  -d "{\"documentText\": \"Scholarship notice: All students must submit form by Dec 1, 2026. Grant is Rs 10,000.\", \"language\": \"English\", \"detailLevel\": \"standard\"}"
```

### 3. Test PDF Upload
```bash
curl -X POST http://localhost:5000/api/v1/documents/analyze \
  -F "file=@/path/to/document.pdf" \
  -F "language=English" \
  -F "detailLevel=standard"
```
