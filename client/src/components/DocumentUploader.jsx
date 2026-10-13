import { useState, useRef, useEffect } from 'react';
import {
  validateDocumentFile,
  validateDocumentText,
  formatFileSize,
  submitDocumentForAnalysis,
  ALLOWED_EXTENSIONS,
  MAX_TEXT_LENGTH_CHARS,
} from '../services/documentService';
import './DocumentUploader.css';

export default function DocumentUploader({ onAnalysisRequested }) {
  // Input mode: 'file' or 'paste'
  const [inputMode, setInputMode] = useState('file');

  // Input state
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedDetail, setSelectedDetail] = useState('standard');

  // Interactive & UI feedback
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalExecutionTime, setFinalExecutionTime] = useState(null);
  const [showExecutionDetails, setShowExecutionDetails] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Completed Analysis payload & view state
  const [completedAnalysis, setCompletedAnalysis] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('summary');
  const [checkedSteps, setCheckedSteps] = useState({});
  const [copyToast, setCopyToast] = useState(null);

  const fileInputRef = useRef(null);
  const startTimeRef = useRef(null);

  // 5 Restrained Stages matching Section 8
  const processingStages = [
    {
      title: 'Stage 1 — Multer In-Memory Ingestion',
      desc: 'Streaming multipart/form-data into memory buffer without disk persistence...',
      detail: 'Validating file MIME type, boundary tags, and buffer allocation in RAM.'
    },
    {
      title: 'Stage 2 — PDF Layout & Text Parsing',
      desc: 'Extracting raw textual content, headers, page boundaries, and formatting...',
      detail: 'Running in-memory PDF stream parser to isolate pure textual nodes.'
    },
    {
      title: 'Stage 3 — Semantic Grounding Engine',
      desc: 'Extracting clauses, conditions, dates, amounts, and eligibility requirements...',
      detail: 'Chunking content with page citations to prevent fabricated facts.'
    },
    {
      title: 'Stage 4 — Gemma 4 31B Instruct ',
      desc: 'Running local AI model with temperature 0.1 for strict factual grounding...',
      detail: 'Executing local prompt inference with strict zero-hallucination constraints.'
    },
    {
      title: 'Stage 5 — Schema Verification & Synthesis',
      desc: 'Validating structured JSON contract and compiling action checklist...',
      detail: 'Cross-verifying all source references against original document chunks.'
    }
  ];

  // Live timer during execution
  useEffect(() => {
    let timer;
    if (isProcessing) {
      timer = setInterval(() => {
        if (startTimeRef.current) {
          const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSeconds(sec);
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  // File selection handlers (guarantees cross-document isolation)
  const handleFileChange = (file) => {
    setApiError(null);
    setValidationError(null);
    setCompletedAnalysis(null);
    setCheckedSteps({});
    setFinalExecutionTime(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

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
    setApiError(null);
    setCompletedAnalysis(null);
    setCheckedSteps({});
    setFinalExecutionTime(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSwitchMode = (mode) => {
    setInputMode(mode);
    setValidationError(null);
    setApiError(null);
    setCompletedAnalysis(null);
    setCheckedSteps({});
    setFinalExecutionTime(null);
  };

  const handleResetAll = () => {
    setSelectedFile(null);
    setPastedText('');
    setUserQuestion('');
    setValidationError(null);
    setApiError(null);
    setCompletedAnalysis(null);
    setCheckedSteps({});
    setActiveResultTab('summary');
    setFinalExecutionTime(null);
    setElapsedSeconds(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler -> Calls backend API
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);
    setApiError(null);

    // Validate inputs based on active mode
    if (inputMode === 'file') {
      if (!selectedFile) {
        setValidationError('Please select a PDF file to analyze.');
        return;
      }
      const val = validateDocumentFile(selectedFile);
      if (!val.valid) {
        setValidationError(val.error);
        return;
      }
    } else {
      if (!pastedText.trim()) {
        setValidationError('Please enter or paste the document text to analyze.');
        return;
      }
      const textVal = validateDocumentText(pastedText);
      if (!textVal.valid) {
        setValidationError(textVal.error);
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStage(0);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    // Stage stepper timer for user feedback while backend executes
    const stageTimer = setInterval(() => {
      setProcessingStage((prev) => (prev < processingStages.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const response = await submitDocumentForAnalysis({
        file: inputMode === 'file' ? selectedFile : null,
        documentText: inputMode === 'paste' ? pastedText : '',
        language: selectedLanguage,
        detailLevel: selectedDetail,
        userQuestion: userQuestion.trim(),
      });

      clearInterval(stageTimer);
      setIsProcessing(false);
      const totalSec = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
      setFinalExecutionTime(totalSec);

      if (response && response.success && response.data) {
        setCompletedAnalysis({
          analysisId: response.analysisId,
          data: response.data,
          fileInfo: response.fileInfo,
        });

        // Initialize checkboxes for action steps
        const initialChecked = {};
        if (response.data.action_steps && response.data.action_steps.length > 0) {
          initialChecked[response.data.action_steps[0].id || '0'] = true;
        }
        setCheckedSteps(initialChecked);

        if (onAnalysisRequested) {
          onAnalysisRequested(response);
        }
      } else {
        throw new Error('Analysis completed but did not return valid document data.');
      }
    } catch (err) {
      clearInterval(stageTimer);
      setIsProcessing(false);
      setApiError(err.message || 'Failed to process document. Please try again.');
    }
  };

  // Checklist toggle
  const toggleStepCheck = (id) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy Summary
  const handleCopySummary = () => {
    if (!completedAnalysis?.data) return;
    const { data, fileInfo } = completedAnalysis;

    let text = `📄 Samjho AI Analysis — ${data.title || fileInfo?.name || 'Document'}\n`;
    text += `Document Type: ${data.document_type || 'Official Notice'}\n`;
    text += `Language: ${data.language || 'English'}\n\n`;
    text += `Summary:\n${data.summary}\n\n`;

    if (data.main_points?.length > 0) {
      text += `Key Points:\n`;
      data.main_points.forEach((p, idx) => {
        text += `${idx + 1}. ${p.heading}: ${p.explanation}\n`;
      });
      text += `\n`;
    }

    if (data.important_dates?.length > 0) {
      text += `Important Dates:\n`;
      data.important_dates.forEach((d) => {
        text += `• ${d.event}: ${d.date_original} (${d.details || 'No additional details'})\n`;
      });
      text += `\n`;
    }

    if (data.important_amounts?.length > 0) {
      text += `Amounts / Fees:\n`;
      data.important_amounts.forEach((a) => {
        text += `• ${a.description}: ${a.amount_original}\n`;
      });
      text += `\n`;
    }

    if (data.disclaimer) {
      text += `Disclaimer: ${data.disclaimer}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopyToast('Summary copied!');
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Copy Checklist
  const handleCopyChecklist = () => {
    if (!completedAnalysis?.data?.action_steps) return;
    const { action_steps, title } = completedAnalysis.data;

    let text = `Action Checklist for "${title || 'Document'}":\n\n`;
    action_steps.forEach((step, idx) => {
      const isChecked = checkedSteps[step.id || idx];
      text += `[${isChecked ? 'X' : ' '}] Step ${step.step || idx + 1}: ${step.action}`;
      if (step.deadline) text += ` (Deadline: ${step.deadline})`;
      if (step.priority) text += ` [${step.priority.toUpperCase()}]`;
      text += `\n`;
      if (step.details) text += `    Details: ${step.details}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopyToast('Checklist copied!');
    setTimeout(() => setCopyToast(null), 2500);
  };

  const analysisData = completedAnalysis?.data;
  const actionSteps = analysisData?.action_steps || [];
  const completedStepsCount = actionSteps.filter((s, idx) => checkedSteps[s.id || idx]).length;
  const hasDates = (analysisData?.important_dates?.length || 0) > 0;
  const hasAmounts = (analysisData?.important_amounts?.length || 0) > 0;

  return (
    <div id="upload-section" className="studio-window card-clean">
      {/* Studio Window Chrome Header */}
      <div className="studio-window-bar">
        <div className="window-controls">
          <span className="window-dot window-dot--close" title="Close" />
          <span className="window-dot window-dot--min" title="Minimize" />
          <span className="window-dot window-dot--max" title="Maximize" />
        </div>
        <div className="window-title">
          <span className="window-title-badge">Samjho AI Studio</span>
          <span className="window-title-separator">/</span>
          <span className="window-title-text">
            {selectedFile
              ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
              : (inputMode === 'paste' && pastedText.trim()
                ? `Pasted Text Document (${pastedText.length.toLocaleString()} chars)`
                : 'Document Analysis Workspace')}
          </span>
        </div>
        <div className="window-status-pill">
          {isProcessing ? (
            <span className="pill-badge pill-badge--busy">
              <span className="pill-pulse" /> Live Execution: Stage {processingStage + 1}/5 ({elapsedSeconds}s)
            </span>
          ) : completedAnalysis ? (
            <span className="pill-badge pill-badge--success">
              ✓ Grounded Result {finalExecutionTime ? `(${finalExecutionTime}s)` : ''}
            </span>
          ) : (
            <span className="pill-badge pill-badge--ready">
              ● Ready · Multer In-Memory &amp; AI Engine
            </span>
          )}
        </div>
      </div>

      {/* Dual Pane Body: Multer Document on Left, Execution Cycle & Proper Content on Right */}
      <div className="studio-window-body">
        {/* ================= LEFT PANE: MULTER DOCUMENT UPLOAD & INPUTS ================= */}
        <aside className="studio-pane-left">
          <div className="pane-section-header">
            <div className="pane-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="pane-section-title">Document Source</h3>
              <p className="pane-section-desc">Uploaded via Multer in-memory stream</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="uploader-form">
            {/* Input Mode Selector */}
            <div className="uploader-mode-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === 'file'}
                className={`mode-tab-btn ${inputMode === 'file' ? 'mode-tab-btn--active' : ''}`}
                onClick={() => handleSwitchMode('file')}
                disabled={isProcessing}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload PDF
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === 'paste'}
                className={`mode-tab-btn ${inputMode === 'paste' ? 'mode-tab-btn--active' : ''}`}
                onClick={() => handleSwitchMode('paste')}
                disabled={isProcessing}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Paste Text
              </button>
            </div>

            {/* Mode 1: PDF Multer Upload */}
            {inputMode === 'file' && (
              <div className="upload-input-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="document-file-input"
                  className="file-hidden-input"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  disabled={isProcessing}
                />

                {!selectedFile ? (
                  <div
                    className={`dropzone-modern ${isDragging ? 'dropzone-modern--active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label="Upload PDF file"
                  >
                    <div className="dropzone-icon-circle">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="dropzone-text-group">
                      <p className="dropzone-main-text">
                        <strong>Drag &amp; drop PDF here</strong>, or click to browse
                      </p>
                      <p className="dropzone-hint-text">
                        Supported: PDF (.pdf up to 10 MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary dropzone-browse-btn"
                      disabled={isProcessing}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse PDF
                    </button>
                  </div>
                ) : (
                  /* Dedicated Multer Staged File Card */
                  <div className="multer-file-card">
                    <div className="multer-badge-row">
                      <span className="multer-status-chip">
                        <span className="multer-dot" /> Multer Staged (In-Memory)
                      </span>
                      <button
                        type="button"
                        className="multer-remove-btn"
                        onClick={handleRemoveFile}
                        title="Remove file"
                        disabled={isProcessing}
                        aria-label="Remove selected file"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="multer-file-body">
                      <div className="multer-icon-box">
                        <span className="multer-pdf-text">PDF</span>
                      </div>
                      <div className="multer-file-meta">
                        <strong className="multer-filename" title={selectedFile.name}>
                          {selectedFile.name}
                        </strong>
                        <span className="multer-filesize">
                          {formatFileSize(selectedFile.size)} · Ready for multipart processing
                        </span>
                      </div>
                    </div>

                    <div className="multer-card-actions">
                      <button
                        type="button"
                        className="btn-change-file"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                      >
                        Change Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Direct Text Input */}
            {inputMode === 'paste' && (
              <div className="paste-text-wrapper">
                <label htmlFor="document-text-area" className="paste-text-label">
                  Paste Document Text
                </label>
                <textarea
                  id="document-text-area"
                  className="paste-text-area"
                  rows={5}
                  placeholder="Paste the full text of an exam notice, scholarship rule, policy clause, bill, or circular here..."
                  value={pastedText}
                  disabled={isProcessing}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    if (validationError) setValidationError(null);
                    if (completedAnalysis) setCompletedAnalysis(null);
                  }}
                />
                <div className="paste-text-footer">
                  <span className="char-counter">
                    {pastedText.length.toLocaleString()} / {MAX_TEXT_LENGTH_CHARS.toLocaleString()} characters
                  </span>
                  {pastedText.length > 0 && !isProcessing && (
                    <button
                      type="button"
                      className="btn-clear-text"
                      onClick={() => setPastedText('')}
                    >
                      Clear text
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Optional Specific Question */}
            <div className="optional-question-field">
              <label htmlFor="initial-question-input" className="selector-label">
                Specific Question (Grounded Q&amp;A)
              </label>
              <input
                id="initial-question-input"
                type="text"
                className="selector-input"
                placeholder="e.g. What is the last date? Is there a fee?"
                value={userQuestion}
                disabled={isProcessing}
                onChange={(e) => setUserQuestion(e.target.value)}
              />
            </div>

            {/* Configuration Selectors */}
            <div className="uploader-selectors-row">
              <div className="selector-field">
                <label htmlFor="language-select" className="selector-label">
                  Language
                </label>
                <select
                  id="language-select"
                  className="selector-input"
                  value={selectedLanguage}
                  disabled={isProcessing}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
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
                  disabled={isProcessing}
                  onChange={(e) => setSelectedDetail(e.target.value)}
                >
                  <option value="simple">Simple</option>
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="alert-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit Action Controls */}
            <div className="uploader-submit-wrapper">
              <button
                type="submit"
                className="btn btn-primary uploader-submit-btn"
                disabled={isProcessing || (inputMode === 'file' ? !selectedFile : !pastedText.trim())}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-inline" />
                    Executing Pipeline ({elapsedSeconds}s)...
                  </>
                ) : (
                  <>
                    Explain This Document
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              {(completedAnalysis || selectedFile || pastedText) && !isProcessing && (
                <button
                  type="button"
                  className="btn btn-secondary btn-reset-pane"
                  onClick={handleResetAll}
                >
                  Reset / New Document
                </button>
              )}
            </div>

            {/* In-Memory Privacy Guarantee */}
            <div className="uploader-privacy-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                <strong>In-Memory Privacy:</strong> Multer buffers file directly in RAM. Zero permanent disk storage.
              </span>
            </div>
          </form>
        </aside>

        {/* ================= RIGHT PANE: EXECUTION CYCLE & PROPER CONTENT ================= */}
        <main className="studio-pane-right">
          <div className="pane-section-header">
            <div className="pane-section-icon pane-section-icon--teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="pane-header-info">
              <h3 className="pane-section-title">
                {isProcessing
                  ? 'Complete Execution Cycle in Progress'
                  : completedAnalysis
                    ? 'Grounded Document Breakdown'
                    : 'Execution Pipeline & Analysis Output'}
              </h3>
              <p className="pane-section-desc">
                {isProcessing
                  ? `Stage ${processingStage + 1} of 5 · Running Gemma`
                  : completedAnalysis
                    ? `Strictly grounded in: ${completedAnalysis.fileInfo?.name || 'Uploaded content'}`
                    : 'Awaiting execution trigger. Preview stages or upload on left.'}
              </p>
            </div>
          </div>

          {/* STATE 1: COMPLETE EXECUTION CYCLE (WHILE PROCESSING) */}
          {isProcessing && (
            <div className="execution-cycle-card" role="status" aria-live="polite">
              {/* Radar Scanner Top Banner */}
              <div className="execution-scanner-banner">
                <div className="scanner-pulse-box">
                  <div className="scanner-ring scanner-ring--1" />
                  <div className="scanner-ring scanner-ring--2" />
                  <div className="scanner-core">⚡</div>
                </div>
                <div className="scanner-text-group">
                  <div className="scanner-stage-badge">
                    STAGE {processingStage + 1} OF 5 · RUNNING GEMMA
                  </div>
                  <h4 className="scanner-active-title">
                    {processingStages[processingStage].title}
                  </h4>
                  <p className="scanner-active-desc">
                    {processingStages[processingStage].desc}
                  </p>
                </div>
                <div className="scanner-timer-box">
                  <span className="scanner-seconds">{elapsedSeconds}s</span>
                  <span className="scanner-time-label">Elapsed</span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="execution-progress-track">
                <div
                  className="execution-progress-bar"
                  style={{ width: `${((processingStage + 1) / processingStages.length) * 100}%` }}
                />
              </div>

              {/* Complete 5-Stage Stepper View */}
              <div className="execution-stepper-list">
                {processingStages.map((stg, idx) => {
                  const isDone = idx < processingStage;
                  const isCurrent = idx === processingStage;

                  return (
                    <div
                      key={stg.title}
                      className={`stepper-stage-item ${
                        isCurrent
                          ? 'stepper-stage-item--current'
                          : isDone
                            ? 'stepper-stage-item--done'
                            : 'stepper-stage-item--pending'
                      }`}
                    >
                      <div className="stage-marker">
                        {isDone ? (
                          <span className="stage-marker-done">✓</span>
                        ) : isCurrent ? (
                          <span className="stage-marker-current" />
                        ) : (
                          <span className="stage-marker-pending">{idx + 1}</span>
                        )}
                      </div>
                      <div className="stage-content">
                        <div className="stage-headline">
                          <strong className="stage-name">{stg.title}</strong>
                          <span className="stage-state-tag">
                            {isDone ? 'Completed' : isCurrent ? 'Running...' : 'Queued'}
                          </span>
                        </div>
                        <p className="stage-detail-desc">{stg.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Technical Activity Ticker */}
              <div className="execution-activity-ticker">
                <span className="ticker-label">Execution Stream:</span>
                <span className="ticker-text">
                  [In-Memory Buffer] Verified ➔ [Text Extraction] OK ➔ [GEMMA Chat API] Prompting qwen3:4b at localhost:11434...
                </span>
              </div>
            </div>
          )}

          {/* STATE 2: PROPER CONTENT BREAKDOWN (UPON COMPLETION) */}
          {!isProcessing && completedAnalysis && (
            <div className="analysis-content-card">
              {/* Execution Cycle Summary Pill */}
              <div className="execution-summary-bar">
                <div className="exec-summary-left">
                  <span className="exec-check-badge">✓</span>
                  <span className="exec-summary-text">
                    <strong>Execution Cycle Succeeded:</strong> 5/5 Stages Completed · {finalExecutionTime ? `${finalExecutionTime}s total` : 'Verified'} · In-Memory Multer &amp; Local GEMMA (qwen3:4b)
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-toggle-pipeline"
                  onClick={() => setShowExecutionDetails(!showExecutionDetails)}
                >
                  {showExecutionDetails ? 'Hide Pipeline' : 'View Pipeline Stages'}
                </button>
              </div>

              {/* Collapsible Execution Stepper Summary */}
              {showExecutionDetails && (
                <div className="execution-recap-dropdown">
                  <div className="recap-stages-grid">
                    {processingStages.map((stg, i) => (
                      <div key={i} className="recap-stage-item">
                        <span className="recap-num">✓ Stage {i + 1}</span>
                        <strong className="recap-title">{stg.title}</strong>
                        <p className="recap-detail">{stg.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Result Header Bar */}
              <div className="inline-analysis-header">
                <div className="inline-title-group">
                  <div className="inline-badges-row">
                    <span className="badge-chip badge-chip--success">GROUNDED RESULT</span>
                    {analysisData.document_type && (
                      <span className="badge-chip">{analysisData.document_type}</span>
                    )}
                    <span className="badge-chip badge-chip--teal">{analysisData.language}</span>
                  </div>
                  <h3 className="inline-doc-name">
                    {analysisData.title || completedAnalysis.fileInfo?.name || 'Document Analysis'}
                  </h3>
                </div>

                <div className="inline-actions-group">
                  <button
                    type="button"
                    className="btn-copy-small"
                    onClick={handleCopySummary}
                    title="Copy summary breakdown"
                  >
                    📋 Copy Summary
                  </button>
                  {actionSteps.length > 0 && (
                    <button
                      type="button"
                      className="btn-copy-small"
                      onClick={handleCopyChecklist}
                      title="Copy action checklist"
                    >
                      ☑️ Copy Checklist
                    </button>
                  )}
                </div>
              </div>

              {/* Copy Toast Alert */}
              {copyToast && (
                <div className="copy-toast-banner" role="status">
                  ✓ {copyToast}
                </div>
              )}

              {/* Structured Executive Insights Matrix */}
              <div className="insights-matrix-grid">
                <div className="insight-card insight-card--primary">
                  <span className="insight-label">📋 Classification</span>
                  <strong className="insight-value">{analysisData.document_type || 'Official Notice'}</strong>
                  <span className="insight-sub">{analysisData.language || 'English'} · Verified Grounded</span>
                </div>

                <div className="insight-card insight-card--warning">
                  <span className="insight-label">⏰ Primary Deadline</span>
                  <strong className="insight-value">
                    {analysisData.important_dates?.[0]?.date_original || 'No strict cutoff'}
                  </strong>
                  <span className="insight-sub" title={analysisData.important_dates?.[0]?.event || ''}>
                    {analysisData.important_dates?.[0]?.event || 'Timeline detailed in Dates tab'}
                  </span>
                </div>

                <div className="insight-card insight-card--teal">
                  <span className="insight-label">💰 Fees &amp; Amounts</span>
                  <strong className="insight-value">
                    {analysisData.important_amounts?.[0]?.amount_original || 'No fees listed'}
                  </strong>
                  <span className="insight-sub" title={analysisData.important_amounts?.[0]?.description || ''}>
                    {analysisData.important_amounts?.[0]?.description || 'Direct document extraction'}
                  </span>
                </div>

                <div className="insight-card insight-card--action">
                  <span className="insight-label">🎯 Action Steps</span>
                  <strong className="insight-value">
                    {actionSteps.length > 0 ? `${actionSteps.length} Steps (${completedStepsCount} Done)` : 'Informational'}
                  </strong>
                  <span className="insight-sub" title={actionSteps[0]?.action || ''}>
                    {actionSteps[0]?.action ? `Next: ${actionSteps[0].action}` : 'Read key points below'}
                  </span>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="inline-tabs-bar" role="tablist">
                <button
                  type="button"
                  className={`inline-tab ${activeResultTab === 'summary' ? 'inline-tab--active' : ''}`}
                  onClick={() => setActiveResultTab('summary')}
                >
                  Insights &amp; Summary
                </button>
                <button
                  type="button"
                  className={`inline-tab ${activeResultTab === 'dates' ? 'inline-tab--active' : ''}`}
                  onClick={() => setActiveResultTab('dates')}
                >
                  Dates &amp; Amounts {(hasDates || hasAmounts) ? `(${(analysisData.important_dates?.length || 0) + (analysisData.important_amounts?.length || 0)})` : ''}
                </button>
                <button
                  type="button"
                  className={`inline-tab ${activeResultTab === 'checklist' ? 'inline-tab--active' : ''}`}
                  onClick={() => setActiveResultTab('checklist')}
                >
                  Checklist {actionSteps.length > 0 ? `(${completedStepsCount}/${actionSteps.length})` : ''}
                </button>
                <button
                  type="button"
                  className={`inline-tab ${activeResultTab === 'eligibility' ? 'inline-tab--active' : ''}`}
                  onClick={() => setActiveResultTab('eligibility')}
                >
                  Eligibility &amp; Docs
                </button>
                {analysisData.user_question_answer?.answer && (
                  <button
                    type="button"
                    className={`inline-tab ${activeResultTab === 'qa' ? 'inline-tab--active' : ''}`}
                    onClick={() => setActiveResultTab('qa')}
                  >
                    Grounded Q&amp;A
                  </button>
                )}
                <button
                  type="button"
                  className={`inline-tab ${activeResultTab === 'warnings' ? 'inline-tab--active' : ''}`}
                  onClick={() => setActiveResultTab('warnings')}
                >
                  Warnings {analysisData.warnings?.length > 0 ? `(${analysisData.warnings.length})` : ''}
                </button>
              </div>

              {/* TAB 1: Structured Insights & Summary */}
              {activeResultTab === 'summary' && (
                <div className="inline-tab-content">
                  {/* Executive Summary Box */}
                  <div className="inline-summary-box">
                    <div className="summary-box-top">
                      <span className="summary-badge">EXECUTIVE SUMMARY</span>
                      <span className="summary-signal">Verified Factual Synthesis</span>
                    </div>
                    <p className="inline-summary-p">{analysisData.summary}</p>
                  </div>

                  {/* Immediate Next Action Prompt */}
                  {actionSteps.length > 0 && (
                    <div className="immediate-next-step-card">
                      <span className="next-step-pill">⚡ IMMEDIATE NEXT STEP</span>
                      <strong className="next-step-title">{actionSteps[0].action}</strong>
                      {actionSteps[0].deadline && (
                        <span className="next-step-deadline">Due: {actionSteps[0].deadline}</span>
                      )}
                    </div>
                  )}

                  {/* Structured Key Insights Breakdown */}
                  {analysisData.main_points && analysisData.main_points.length > 0 ? (
                    <div className="main-points-section">
                      <h4 className="tab-section-title">Key Provisions &amp; Insights</h4>
                      <div className="main-points-list">
                        {analysisData.main_points.map((point, idx) => (
                          <div key={idx} className="main-point-item">
                            <div className="point-header">
                              <span className="point-number">{idx + 1}</span>
                              <strong className="point-heading">{point.heading}</strong>
                              {point.source_references?.map((ref) => (
                                <span key={ref} className="ref-tag">[{ref}]</span>
                              ))}
                            </div>
                            <p className="point-explanation">{point.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-sub-notice">No additional key points were identified in this document.</p>
                  )}
                </div>
              )}

              {/* TAB 2: Important Dates & Amounts */}
              {activeResultTab === 'dates' && (
                <div className="inline-tab-content">
                  {!hasDates && !hasAmounts ? (
                    <div className="empty-tab-box">
                      <p>No specific dates, deadlines, or monetary amounts were found in this document.</p>
                    </div>
                  ) : (
                    <>
                      {hasDates && (
                        <div className="dates-sub-section">
                          <h4 className="tab-section-title">Deadlines &amp; Dates Mentioned</h4>
                          <div className="inline-dates-grid">
                            {analysisData.important_dates.map((d, idx) => (
                              <div key={idx} className="inline-date-chip">
                                <span className="date-chip-badge">{d.date_original}</span>
                                <div className="date-chip-info">
                                  <strong className="date-chip-event">{d.event}</strong>
                                  {d.details && <p className="date-chip-details">{d.details}</p>}
                                </div>
                                {d.source_references?.map((ref) => (
                                  <span key={ref} className="ref-tag">[{ref}]</span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasAmounts && (
                        <div className="amounts-sub-section">
                          <h4 className="tab-section-title">Fees, Stipends &amp; Amounts</h4>
                          <div className="inline-amounts-grid">
                            {analysisData.important_amounts.map((amt, idx) => (
                              <div key={idx} className="amount-card">
                                <span className="amount-val">{amt.amount_original}</span>
                                <div className="amount-info">
                                  <strong>{amt.description}</strong>
                                  {amt.details && <p>{amt.details}</p>}
                                </div>
                                {amt.source_references?.map((ref) => (
                                  <span key={ref} className="ref-tag">[{ref}]</span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: Action Checklist */}
              {activeResultTab === 'checklist' && (
                <div className="inline-tab-content">
                  {actionSteps.length > 0 ? (
                    <>
                      <div className="checklist-progress-bar-wrapper">
                        <div className="checklist-progress-header">
                          <span>Progress: {completedStepsCount} of {actionSteps.length} steps completed</span>
                          <span className="percent-label">
                            {actionSteps.length ? Math.round((completedStepsCount / actionSteps.length) * 100) : 0}%
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${actionSteps.length ? (completedStepsCount / actionSteps.length) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="inline-checklist-items">
                        {actionSteps.map((step, idx) => {
                          const stepId = step.id || idx;
                          const isChecked = !!checkedSteps[stepId];
                          return (
                            <div
                              key={stepId}
                              className={`checklist-step-row ${isChecked ? 'checklist-step-row--checked' : ''}`}
                            >
                              <label className="inline-check-label">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleStepCheck(stepId)}
                                  className="inline-check-box"
                                />
                                <div className="step-content">
                                  <div className="step-top-line">
                                    <span className="step-num-badge">Step {step.step || idx + 1}</span>
                                    <strong className="step-action-text">{step.action}</strong>
                                    {step.priority && (
                                      <span className={`priority-badge priority-badge--${step.priority}`}>
                                        {step.priority.toUpperCase()}
                                      </span>
                                    )}
                                    {step.deadline && (
                                      <span className="deadline-badge">Due: {step.deadline}</span>
                                    )}
                                  </div>
                                  {step.details && <p className="step-details-text">{step.details}</p>}
                                </div>
                              </label>
                              {step.source_references?.map((ref) => (
                                <span key={ref} className="ref-tag">[{ref}]</span>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="empty-tab-box">
                      <p>No specific action steps or checklist tasks were identified in this document.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Eligibility & Required Documents */}
              {activeResultTab === 'eligibility' && (
                <div className="inline-tab-content">
                  {analysisData.eligibility?.criteria?.length > 0 && (
                    <div className="eligibility-sub-section">
                      <h4 className="tab-section-title">Eligibility Criteria</h4>
                      <div className="criteria-list">
                        {analysisData.eligibility.criteria.map((c, idx) => (
                          <div key={idx} className="criteria-item">
                            <div className="criteria-header">
                              <strong className="criteria-req">{c.requirement}</strong>
                              {c.mandatory && <span className="mandatory-badge">Mandatory</span>}
                              {c.source_references?.map((ref) => (
                                <span key={ref} className="ref-tag">[{ref}]</span>
                              ))}
                            </div>
                            {c.details && <p className="criteria-details">{c.details}</p>}
                          </div>
                        ))}
                      </div>
                      {analysisData.eligibility.notes && (
                        <p className="eligibility-notes">
                          <strong>Note:</strong> {analysisData.eligibility.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {analysisData.required_documents?.length > 0 && (
                    <div className="docs-sub-section">
                      <h4 className="tab-section-title">Required Documents</h4>
                      <div className="docs-list">
                        {analysisData.required_documents.map((doc, idx) => (
                          <div key={idx} className="doc-item">
                            <div className="doc-header">
                              <span className="doc-icon">📄</span>
                              <strong className="doc-name">{doc.name}</strong>
                              {doc.mandatory && <span className="mandatory-badge">Required</span>}
                              {doc.source_references?.map((ref) => (
                                <span key={ref} className="ref-tag">[{ref}]</span>
                              ))}
                            </div>
                            {doc.details && <p className="doc-details">{doc.details}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!analysisData.eligibility?.criteria?.length && !analysisData.required_documents?.length && (
                    <div className="empty-tab-box">
                      <p>No eligibility criteria or required document attachments were specified in this document.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Grounded Q&A */}
              {activeResultTab === 'qa' && analysisData.user_question_answer?.answer && (
                <div className="inline-tab-content">
                  <div className="inline-qa-response-card">
                    <div className="qa-header-row">
                      <span className="inline-qa-q">Q: {analysisData.user_question_answer.question}</span>
                      <span className={`confidence-badge confidence-badge--${analysisData.user_question_answer.confidence || 'high'}`}>
                        Confidence: {analysisData.user_question_answer.confidence}
                      </span>
                    </div>
                    <p className="inline-qa-a">{analysisData.user_question_answer.answer}</p>
                    {analysisData.user_question_answer.evidence?.length > 0 && (
                      <div className="qa-evidence-list">
                        <span className="evidence-title">Supporting Document Evidence:</span>
                        {analysisData.user_question_answer.evidence.map((ev, idx) => (
                          <blockquote key={idx} className="evidence-quote">
                            "{ev.text}"
                            {ev.source_references?.map((ref) => (
                              <span key={ref} className="ref-tag">[{ref}]</span>
                            ))}
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: Warnings & Disclaimers */}
              {activeResultTab === 'warnings' && (
                <div className="inline-tab-content">
                  {analysisData.warnings?.length > 0 ? (
                    analysisData.warnings.map((w, idx) => (
                      <div key={idx} className="warning-banner-item">
                        <div className="warning-top">
                          <span className="warning-type">⚠️ {w.type}</span>
                          {w.source_references?.map((ref) => (
                            <span key={ref} className="ref-tag">[{ref}]</span>
                          ))}
                        </div>
                        <p className="warning-msg">{w.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="empty-tab-box">
                      <p>No penalty warnings or strict conditions were noted in this document.</p>
                    </div>
                  )}

                  {analysisData.disclaimer && (
                    <div className="disclaimer-box">
                      <strong>Notice:</strong> {analysisData.disclaimer}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STATE 3: IDLE / WAITING WORKSPACE VIEW */}
          {!isProcessing && !completedAnalysis && !apiError && (
            <div className="workspace-idle-card">
              <div className="idle-illustration">
                <div className="idle-icon-ring">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
              </div>

              <h4 className="idle-title">Execution Pipeline Ready</h4>
              <p className="idle-subtitle">
                {selectedFile
                  ? `"${selectedFile.name}" is staged via Multer. Click "Explain This Document" on the left to start the 5-stage execution cycle.`
                  : 'Select or drag your PDF document on the left. The live execution cycle and structured analysis will display here in real time.'}
              </p>

              {/* Pipeline Blueprint Flowchart */}
              <div className="pipeline-blueprint-flow">
                <div className="blueprint-node">
                  <div className="node-badge">1</div>
                  <strong className="node-title">Multer In-Memory</strong>
                  <span className="node-desc">RAM buffer stream</span>
                </div>
                <div className="blueprint-arrow">➔</div>
                <div className="blueprint-node">
                  <div className="node-badge">2</div>
                  <strong className="node-title">PDF Extraction</strong>
                  <span className="node-desc">Page-indexed chunks</span>
                </div>
                <div className="blueprint-arrow">➔</div>
                <div className="blueprint-node">
                  <div className="node-badge">3</div>
                  <strong className="node-title">GEMMA</strong>
                  <span className="node-desc">Zero hallucinations</span>
                </div>
                <div className="blueprint-arrow">➔</div>
                <div className="blueprint-node">
                  <div className="node-badge">4</div>
                  <strong className="node-title">Grounded Result</strong>
                  <span className="node-desc">Summary &amp; checklist</span>
                </div>
              </div>

              <div className="idle-features-row">
                <div className="idle-feat-pill">
                  <span className="feat-check">✓</span> 100% In-Memory Privacy
                </div>
                <div className="idle-feat-pill">
                  <span className="feat-check">✓</span> Local AI Model Execution
                </div>
                <div className="idle-feat-pill">
                  <span className="feat-check">✓</span> Source Document Citations
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: API ERROR DISPLAY */}
          {!isProcessing && apiError && (
            <div className="workspace-error-card" role="alert">
              <div className="error-icon-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="error-text-content">
                <h4 className="error-title">Pipeline Execution Stopped</h4>
                <p className="error-desc">{apiError}</p>
                <div className="error-actions-row">
                  <button
                    type="button"
                    className="btn btn-primary btn-retry-error"
                    onClick={handleSubmit}
                  >
                    Retry Execution
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleResetAll}
                  >
                    Reset Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
