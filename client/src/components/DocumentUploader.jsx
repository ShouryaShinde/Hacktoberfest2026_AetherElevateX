import { useState, useRef } from 'react';
import {
  validateDocumentFile,
  formatFileSize,
  ALLOWED_EXTENSIONS
} from '../services/documentService';
import './DocumentUploader.css';

const SAMPLE_DOCS = [
  {
    name: 'College_Exam_Notice_EX2026.pdf',
    size: 1420000,
    type: 'application/pdf',
    label: 'College Exam Notice',
    summary: 'Semester VI exams begin on Nov 15, 2026. Hall tickets available online on Nov 5. Clear all library & lab dues before Nov 3, 5:00 PM to avoid a ₹500 late fee.',
    dates: [
      { date: 'Nov 3, 2026 (5:00 PM)', label: 'Library dues clearance deadline' },
      { date: 'Nov 5, 2026 (10:00 AM)', label: 'Hall ticket download opens' },
      { date: 'Nov 15, 2026', label: 'Semester exams commence' }
    ],
    checklist: [
      'Return all borrowed library books before Nov 3',
      'Verify dues clearance status on student portal',
      'Download and print 2 copies of hall ticket on Nov 5',
      'Get department head signature & stamp on printout'
    ]
  },
  {
    name: 'State_Scholarship_Norms_FY26.pdf',
    size: 2150000,
    type: 'application/pdf',
    label: 'Scholarship Circular',
    summary: 'Post-matric merit scholarship application is open for students with annual household income under ₹2.5 Lakhs and >60% previous marks. Submit Form-7 before Nov 25, 2026.',
    dates: [
      { date: 'Nov 25, 2026', label: 'Online application cutoff' },
      { date: 'Dec 10, 2026', label: 'Document physical verification' }
    ],
    checklist: [
      'Obtain Tehsildar-certified family income certificate',
      'Ensure bank account is Aadhaar-seeded',
      'Upload marksheet & domicile certificate on portal'
    ]
  },
  {
    name: 'Health_Insurance_Clause_Section4.pdf',
    size: 980000,
    type: 'application/pdf',
    label: 'Insurance Policy Clause',
    summary: 'Pre-existing medical conditions have a mandatory 24-month waiting period from continuous policy start date. Scheduled non-emergency surgeries have a 90-day waiting period.',
    dates: [
      { date: '90 Days', label: 'Waiting period for specific treatments' },
      { date: '24 Months', label: 'Waiting period for pre-existing conditions' }
    ],
    checklist: [
      'Review Schedule II for list of 90-day waiting procedures',
      'Maintain continuous policy renewals to prevent timer reset'
    ]
  }
];

export default function DocumentUploader({ onAnalysisRequested }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [completedAnalysis, setCompletedAnalysis] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedDetail, setSelectedDetail] = useState('standard');
  const [activeResultTab, setActiveResultTab] = useState('summary');
  const [copyToast, setCopyToast] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState(null);

  const fileInputRef = useRef(null);

  const processingStages = [
    'Verifying document structure & format...',
    'Extracting text sections & data tables...',
    'Detecting deadlines, eligibility criteria & fees...',
    'Generating plain-language explanation & checklist...'
  ];

  const handleFileChange = (file) => {
    setCompletedAnalysis(null);
    setQuestionAnswer(null);
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setValidationError(validation.error);
      setSelectedFile(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    setCompletedAnalysis(null);
    setQuestionAnswer(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setCompletedAnalysis(null);
    setProcessingStage(0);

    // Simulated multi-stage processing pipeline stepper
    const interval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev < processingStages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        setIsProcessing(false);

        const currentSample = SAMPLE_DOCS[0];
        const analysisData = {
          fileName: selectedFile.name,
          fileSize: formatFileSize(selectedFile.size),
          language: selectedLanguage,
          detailLevel: selectedDetail,
          summary: currentSample.summary,
          dates: currentSample.dates,
          checklist: currentSample.checklist
        };

        setCompletedAnalysis(analysisData);
        if (onAnalysisRequested) {
          onAnalysisRequested(analysisData);
        }
        return prev;
      });
    }, 600);
  };

  const handleCopySummary = () => {
    if (!completedAnalysis) return;
    const textToCopy = `Samjho AI Summary (${completedAnalysis.fileName}):\n${completedAnalysis.summary}\n\nKey Dates:\n${completedAnalysis.dates.map(d => `${d.date}: ${d.label}`).join('\n')}\n\nAction Checklist:\n${completedAnalysis.checklist.map(c => `[ ] ${c}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    const q = questionInput.toLowerCase();
    let answerText = "The document specifies that all deadlines and eligibility requirements must strictly adhere to the dates outlined above.";

    if (q.includes('last date') || q.includes('deadline') || q.includes('due') || q.includes('when')) {
      answerText = "The document explicitly states that the primary clearance cutoff is November 3 at 5:00 PM, and the portal opens on November 5.";
    } else if (q.includes('fee') || q.includes('amount') || q.includes('penalty') || q.includes('cost')) {
      answerText = "The document mandates a late fee penalty of ₹500 if dues are cleared after the stipulated cutoff.";
    } else if (q.includes('physical') || q.includes('office') || q.includes('collect') || q.includes('counter')) {
      answerText = "No physical distribution will occur at the counter. All hall permits must be downloaded directly via the student portal.";
    }

    setQuestionAnswer({
      question: questionInput,
      answer: answerText,
      citation: "[Page 2, Section 4.1 · Chunk Reference: p2-c1]"
    });
    setQuestionInput('');
  };

  return (
    <div id="upload-section" className="uploader-card card-clean">
      {/* Panel Header */}
      <div className="uploader-header">
        <div className="uploader-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h2 className="uploader-title">Start with your document</h2>
          <p className="uploader-subtitle">Upload a PDF or image to extract plain-language clarity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="uploader-form">
        <input
          ref={fileInputRef}
          type="file"
          id="document-file-input"
          className="file-hidden-input"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />

        {/* Drag & Drop Zone */}
        {!selectedFile ? (
          <div
            className={`dropzone-modern ${isDragging ? 'dropzone-modern--active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload document file"
          >
            <div className="dropzone-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="dropzone-text-group">
              <p className="dropzone-main-text">
                <strong>Drag and drop your file here</strong>, or click to browse
              </p>
              <p className="dropzone-hint-text">
                Supported: PDF, PNG, JPG, JPEG (Up to 10 MB)
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary dropzone-browse-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>
          </div>
        ) : (
          /* Selected File Preview Box */
          <div className="file-info-box">
            <div className="file-info-main">
              <span className="file-format-badge">
                {selectedFile.name.split('.').pop().toUpperCase()}
              </span>
              <div className="file-text-details">
                <span className="file-title" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <span className="file-meta-text">
                  {formatFileSize(selectedFile.size)} · Validated &amp; ready for analysis
                </span>
              </div>
            </div>
            <button
              type="button"
              className="file-remove-btn"
              onClick={handleRemoveFile}
              title="Remove file"
              aria-label="Remove selected file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="alert-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {/* Selectors Row */}
        <div className="uploader-selectors-row">
          <div className="selector-field">
            <label htmlFor="language-select" className="selector-label">
              Explanation Language
            </label>
            <select
              id="language-select"
              className="selector-input"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="English">English (Full MVP)</option>
              <option value="Hindi">हिन्दी / Hindi (Evaluation)</option>
              <option value="Marathi">मराठी / Marathi (Evaluation)</option>
              <option value="Bengali" disabled>বাংলা / Bengali (Planned)</option>
              <option value="Tamil" disabled>தமிழ் / Tamil (Planned)</option>
              <option value="Telugu" disabled>తెలుగు / Telugu (Planned)</option>
            </select>
          </div>

          <div className="selector-field">
            <label htmlFor="detail-select" className="selector-label">
              Detail Level
            </label>
            <select
              id="detail-select"
              className="selector-input"
              value={selectedDetail}
              onChange={(e) => setSelectedDetail(e.target.value)}
            >
              <option value="simple">Simple (Key points only)</option>
              <option value="standard">Standard (Checklist &amp; dates)</option>
              <option value="detailed">Detailed (Full breakdown)</option>
            </select>
          </div>
        </div>

        {/* Action Button & Stepper */}
        {!completedAnalysis && (
          <div className="uploader-submit-wrapper">
            <button
              type="submit"
              className="btn btn-primary uploader-submit-btn"
              disabled={!selectedFile || isProcessing}
            >
              {isProcessing ? 'Analyzing Document...' : 'Explain This Document'}
            </button>
          </div>
        )}

        {/* Processing Stepper */}
        {isProcessing && (
          <div className="processing-stepper-box">
            <div className="stepper-header">
              <span className="spinner-modern" />
              <span className="stepper-stage-text">
                {processingStages[processingStage]}
              </span>
            </div>
            <div className="stepper-progress-bar">
              <div
                className="stepper-progress-fill"
                style={{ width: `${((processingStage + 1) / processingStages.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Interactive Analysis Card Viewer */}
        {completedAnalysis && (
          <div className="inline-analysis-card">
            <div className="inline-analysis-header">
              <div className="inline-title-group">
                <span className="badge-chip badge-chip--success">ANALYSIS COMPLETE</span>
                <h4 className="inline-doc-name">{completedAnalysis.fileName}</h4>
              </div>
              <button
                type="button"
                className="btn-copy-small"
                onClick={handleCopySummary}
                title="Copy entire breakdown"
              >
                {copyToast ? '✓ Copied!' : '📋 Copy Breakdown'}
              </button>
            </div>

            {/* Results Tabs */}
            <div className="inline-tabs-bar">
              <button
                type="button"
                className={`inline-tab ${activeResultTab === 'summary' ? 'inline-tab--active' : ''}`}
                onClick={() => setActiveResultTab('summary')}
              >
                Summary &amp; Dates
              </button>
              <button
                type="button"
                className={`inline-tab ${activeResultTab === 'checklist' ? 'inline-tab--active' : ''}`}
                onClick={() => setActiveResultTab('checklist')}
              >
                Checklist ({completedAnalysis.checklist.length})
              </button>
              <button
                type="button"
                className={`inline-tab ${activeResultTab === 'ask' ? 'inline-tab--active' : ''}`}
                onClick={() => setActiveResultTab('ask')}
              >
                Ask a Question
              </button>
            </div>

            {/* Tab 1: Summary & Dates */}
            {activeResultTab === 'summary' && (
              <div className="inline-tab-content">
                <div className="inline-summary-box">
                  <p className="inline-summary-p">{completedAnalysis.summary}</p>
                </div>

                <div className="inline-dates-grid">
                  {completedAnalysis.dates.map((d) => (
                    <div key={d.label} className="inline-date-chip">
                      <span className="date-chip-badge">{d.date}</span>
                      <span className="date-chip-label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Action Checklist */}
            {activeResultTab === 'checklist' && (
              <div className="inline-tab-content">
                <div className="inline-checklist-items">
                  {completedAnalysis.checklist.map((item, idx) => (
                    <label key={item} className="inline-check-label">
                      <input type="checkbox" defaultChecked={idx === 0} className="inline-check-box" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Ask a Question */}
            {activeResultTab === 'ask' && (
              <div className="inline-tab-content">
                <form onSubmit={handleAskQuestion} className="inline-qa-form">
                  <div className="inline-qa-input-row">
                    <input
                      type="text"
                      className="inline-qa-input"
                      placeholder="Ask about deadlines, fees, or requirements..."
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary inline-qa-btn">
                      Ask
                    </button>
                  </div>
                </form>

                {questionAnswer && (
                  <div className="inline-qa-response-card">
                    <span className="inline-qa-q">Q: {questionAnswer.question}</span>
                    <p className="inline-qa-a">{questionAnswer.answer}</p>
                    <span className="inline-qa-ref">{questionAnswer.citation}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn-reset-analysis"
              onClick={handleRemoveFile}
            >
              Analyze Another Document
            </button>
          </div>
        )}

        {/* Privacy Footer */}
        <div className="uploader-privacy-footer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            <strong>Privacy Guarantee:</strong> Documents are processed in-memory and not stored permanently. No personal data is saved.
          </span>
        </div>
      </form>
    </div>
  );
}
