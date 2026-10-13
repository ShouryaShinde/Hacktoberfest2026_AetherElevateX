import { useState, useRef } from 'react';
import {
  validateDocumentFile,
  formatFileSize,
  submitDocumentForAnalysis,
  ALLOWED_EXTENSIONS
} from '../services/documentService';
import './DocumentUploader.css';

export default function DocumentUploader({ onAnalysisRequested }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedDetail, setSelectedDetail] = useState('standard');

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setFeedback(null);
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
    setFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setFeedback(null);

    try {
      const result = await submitDocumentForAnalysis(
        selectedFile,
        selectedLanguage,
        selectedDetail
      );

      setFeedback({
        type: result.backendReady ? 'success' : 'info',
        title: result.backendReady ? 'Analysis Ready' : 'Client Validation Complete',
        message: result.message,
        details: result.fileInfo
      });

      if (onAnalysisRequested) {
        onAnalysisRequested(result);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Validation Error',
        message: err.message || 'Failed to process document.'
      });
    } finally {
      setIsProcessing(false);
    }
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
          <p className="uploader-subtitle">Upload a PDF or image to get started.</p>
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
                <strong>Drag and drop your file here</strong>, or browse
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
          /* Selected File Information Box */
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
                  {formatFileSize(selectedFile.size)} · Validated &amp; ready
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

        {/* Configuration Selectors */}
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

        {/* Primary Action Button */}
        <div className="uploader-submit-wrapper">
          <button
            type="submit"
            className="btn btn-primary uploader-submit-btn"
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner-modern" />
                Validating Document...
              </>
            ) : (
              'Explain This Document'
            )}
          </button>
        </div>

        {/* Transparent Feedback State */}
        {feedback && (
          <div className={`feedback-card feedback-card--${feedback.type}`} role="status">
            <div className="feedback-header">
              <span className="badge-chip badge-chip--teal">STATUS NOTICE</span>
              <strong className="feedback-title">{feedback.title}</strong>
            </div>
            <p className="feedback-desc">{feedback.message}</p>
            {feedback.details && (
              <div className="feedback-pills">
                <span className="feedback-pill">{feedback.details.name}</span>
                <span className="feedback-pill">{feedback.details.size}</span>
                <span className="feedback-pill">Target: {feedback.details.language}</span>
              </div>
            )}
          </div>
        )}

        {/* Accurate Privacy Note */}
        <div className="uploader-privacy-footer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            <strong>Privacy Guarantee:</strong> Documents are processed in-memory and not stored permanently. No personal data is collected.
          </span>
        </div>
      </form>
    </div>
  );
}
