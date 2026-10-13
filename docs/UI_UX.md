# UI/UX Specification

## Product feel
Approachable, calm, trustworthy, and practical. Avoid a generic “AI neon dashboard” look. Use a light neutral background, readable charcoal text, one restrained primary accent, generous spacing, and clear cards. Ensure good contrast and responsive behavior.

## Screens and layout
### 1. Landing / workspace
- Brand: Samjho AI.
- Headline: “Understand the information. Know what to do next.”
- Short explanation of supported documents.
- Primary upload dropzone and secondary paste-text option.
- Language selector: English, Hindi, Marathi.
- Detail selector: Simple, Standard, Detailed.
- Privacy note: explain temporary processing and retention accurately.
- Supported format/size hint from server configuration.

### 2. Processing state
Use a stepper or status messages:
1. Reading document
2. Extracting text
3. Understanding key details
4. Preparing your checklist
Never imply a specific stage if the backend cannot report it. Provide cancel/reset if practical.

### 3. Analysis results
Recommended order:
1. Document title/type and summary.
2. Main points.
3. Action checklist.
4. Important dates and amounts.
5. Eligibility.
6. Required documents.
7. Warnings/missing information.
8. Source evidence and “Ask about this document”.
Use section headings, short paragraphs, badges only where semantically useful, and empty states for absent information.

### 4. Ask a question
- Text input and submit button.
- Show answer with evidence passages and source labels.
- If the answer is not found in the document, say that directly.
- Preserve the selected language.
- Disable repeated submission while a request is pending.

## Reusable components
- `DocumentDropzone`
- `PasteTextDialog` or `PasteTextPanel`
- `LanguageSelector`
- `DetailLevelSelector`
- `ProcessingStatus`
- `SummaryCard`
- `MainPointsList`
- `EligibilitySection`
- `RequiredDocumentsChecklist`
- `ImportantDatesList`
- `ImportantAmountsList`
- `ActionChecklist`
- `WarningsPanel`
- `SourceEvidence`
- `DocumentQuestionInput`
- `ErrorAlert`
- `CopyButton`
- `EmptySection`

## Interaction states
Every asynchronous feature needs loading, success, error, and empty states. Support drag/drop plus keyboard file selection. Display upload progress only if it can be measured. Show a retry action for recoverable failures. Do not erase the selected document on a transient model error unless the user requests reset.

## Accessibility
- Semantic headings and buttons.
- Labels for every input.
- Keyboard-accessible upload and checklist.
- Visible focus styles.
- Do not rely on color alone for warnings or priorities.
- Use `aria-live` for status/error updates where appropriate.
- Avoid tiny text and horizontal overflow on mobile.

## Frontend rendering rules
- Treat API data as untrusted and render strings as text.
- Do not render raw model HTML or markdown as trusted HTML.
- Map known schema fields to explicit components.
- Hide a section only when it has no useful content; do not invent placeholder facts.
- Show source labels only when a validated reference exists.
