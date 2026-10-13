import './ProductPreview.css';

export default function ProductPreview() {
  return (
    <section id="product-preview" className="product-preview-section section-spacing">
      <div className="container">
        {/* Section Header */}
        <div className="preview-intro-block">
          <span className="eyebrow">WORKSPACE DEMONSTRATION</span>
          <h2 className="preview-title-text">
            What real clarity <span className="headline-accent">looks like.</span>
          </h2>
          <p className="preview-subtitle-text">
            Here is how Samjho AI structures a dense four-page official college circular into plain language,
            verifiable deadlines, and grounded answers.
          </p>

          <div className="preview-sample-banner">
            <span className="badge-chip badge-chip--teal">SAMPLE PREVIEW</span>
            <span className="preview-notice-text">
              Simulated demonstration based on Phase 1 contract specifications. Not live output.
            </span>
          </div>
        </div>

        {/* Document Reader Workspace Card */}
        <div className="workspace-reader-card card-clean">
          {/* Header Metadata Bar */}
          <div className="reader-top-bar">
            <div className="reader-doc-meta">
              <span className="badge-chip">COLLEGE NOTICE</span>
              <span className="meta-text-item">Notice: #EX-2026/08</span>
              <span className="meta-text-item">Length: 4 Pages</span>
              <span className="meta-text-item">Language: English</span>
            </div>
            <div className="reader-status-pill">
              <span className="status-live-dot" />
              <span>Simulated Analysis Record</span>
            </div>
          </div>

          {/* Document Title Header */}
          <div className="reader-title-section">
            <span className="eyebrow-mini">ANALYZED DOCUMENT</span>
            <h3 className="reader-document-title">
              Notice No. EX-2026/08 — Semester Examination Schedule &amp; Hall Ticket Guidelines
            </h3>
          </div>

          {/* Plain-Language Explanation */}
          <div className="reader-summary-panel">
            <div className="panel-badge-row">
              <span className="badge-chip badge-chip--teal">PLAIN-LANGUAGE EXPLANATION</span>
            </div>
            <p className="summary-body">
              All undergraduate semester examinations will commence on <strong>November 15, 2026</strong>.
              Hall tickets will be released exclusively through the student portal on <strong>November 5, 2026</strong>.
              Students with pending library book returns or unpaid lab dues must clear them by <strong>November 3, 2026</strong>
              to prevent their hall tickets from being withheld. No physical hall tickets will be issued at the administration counter.
            </p>
          </div>

          {/* Structured Two-Column Breakdown */}
          <div className="reader-breakdown-columns">
            {/* Left Column: Key Points & Deadlines */}
            <div className="reader-col">
              {/* Key Points */}
              <div className="breakdown-box">
                <h4 className="breakdown-heading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Important Requirements
                </h4>
                <ul className="requirements-list">
                  <li>
                    <strong>Mandatory Digital Download:</strong> Hall tickets are strictly digital PDF downloads. Printing at home is required.
                  </li>
                  <li>
                    <strong>Clearance Prerequisite:</strong> Library book clearance is strictly required before portal generation unlocks.
                  </li>
                  <li>
                    <strong>Attestation Requirement:</strong> Affix a recent passport-size photograph and have it attested by your department head.
                  </li>
                </ul>
              </div>

              {/* Dates and Deadlines */}
              <div className="breakdown-box">
                <h4 className="breakdown-heading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Important Deadlines &amp; Fees
                </h4>
                <div className="deadlines-list">
                  <div className="deadline-row">
                    <div className="deadline-badge">NOV 03</div>
                    <div className="deadline-content">
                      <span className="deadline-name">Library Dues Clearance Cutoff</span>
                      <span className="deadline-sub">5:00 PM IST (Strict deadline)</span>
                    </div>
                  </div>
                  <div className="deadline-row">
                    <div className="deadline-badge">NOV 05</div>
                    <div className="deadline-content">
                      <span className="deadline-name">Hall Ticket Portal Opens</span>
                      <span className="deadline-sub">10:00 AM IST onwards</span>
                    </div>
                  </div>
                  <div className="deadline-row">
                    <div className="deadline-badge deadline-badge--tint">₹500</div>
                    <div className="deadline-content">
                      <span className="deadline-name">Late Submission Penalty Fee</span>
                      <span className="deadline-sub">Applies if dues cleared after Nov 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Action Checklist & Grounded Q&A */}
            <div className="reader-col">
              {/* Action Checklist */}
              <div className="breakdown-box">
                <h4 className="breakdown-heading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                  Action Checklist
                </h4>
                <div className="checklist-stack">
                  <label className="checklist-row">
                    <input type="checkbox" defaultChecked className="check-box-input" />
                    <span className="check-text">Return all issued books to central library before Nov 3</span>
                  </label>
                  <label className="checklist-row">
                    <input type="checkbox" defaultChecked className="check-box-input" />
                    <span className="check-text">Check student portal for clearance status verification</span>
                  </label>
                  <label className="checklist-row">
                    <input type="checkbox" className="check-box-input" />
                    <span className="check-text">Download PDF hall ticket on Nov 5 and print 2 copies</span>
                  </label>
                  <label className="checklist-row">
                    <input type="checkbox" className="check-box-input" />
                    <span className="check-text">Get HOD stamp and signature on hall ticket printout</span>
                  </label>
                </div>
              </div>

              {/* Grounded Follow-up Q&A */}
              <div className="breakdown-box qa-box">
                <h4 className="breakdown-heading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Document-Grounded Q&amp;A
                </h4>

                <div className="qa-thread">
                  <div className="qa-user-bubble">
                    <span className="qa-label">USER QUESTION:</span>
                    <p className="qa-user-text">
                      &ldquo;Can I collect my physical hall ticket from the college office if I don&apos;t have a printer?&rdquo;
                    </p>
                  </div>

                  <div className="qa-answer-card">
                    <div className="qa-answer-header">
                      <span className="qa-label">GROUNDED ANSWER:</span>
                      <span className="badge-chip badge-chip--success">HIGH CONFIDENCE</span>
                    </div>
                    <p className="qa-answer-paragraph">
                      <strong>No.</strong> The notice explicitly specifies that hall tickets will only be generated in digital format
                      through the student portal. The examination branch will <em>not</em> distribute physical hardcopies at the administrative counter.
                    </p>

                    <div className="citation-container">
                      <span className="citation-header-text">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Verified Source Passage:
                      </span>
                      <blockquote className="citation-quote-text">
                        &ldquo;Hall tickets will only be generated in digital format via the university portal. The examination branch will not distribute physical hardcopies under any circumstances.&rdquo;
                      </blockquote>
                      <span className="citation-location">[Page 2, Section 4.1 · Chunk Ref: p2-c1]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
