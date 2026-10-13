import { useState } from 'react';
import './ComparisonSection.css';

export default function ComparisonSection() {
  const [activeTab, setActiveTab] = useState(0);

  const samples = [
    {
      id: 'exam',
      label: 'College Exam Circular',
      docType: 'University Examination Notice',
      original: {
        heading: 'Notification No. EX-44/2026 Pursuant to Ordinance 17-A',
        text: 'In continuation of earlier notification dated 12th ult., it is hereby informed to all eligible examinees of Semester VI (CBCS) that subject to clearance of outstanding dues in respect of library holdings and departmental laboratories pursuant to Clause 9(d), the online generation of examination permits shall commence effective 05-11-2026. Non-compliance with the stipulated timeline regarding dues settlement on or before 17:00 hrs on 03-11-2026 shall entail preclusion from hall permit generation and levy of late remittance fee of Rs. 500/- under Rule 22.'
      },
      transformed: {
        summary: 'Final semester exam permits will be available online on Nov 5, 2026. Clear all library and lab dues by Nov 3, 5:00 PM to avoid a ₹500 penalty and permit blockage.',
        keyDates: [
          { date: 'Nov 3, 5:00 PM', event: 'Deadline to clear library & lab dues' },
          { date: 'Nov 5, 10:00 AM', event: 'Hall ticket download opens online' }
        ],
        actions: [
          'Return pending library books and get clearance signature',
          'Download digital hall ticket on Nov 5 (no physical distribution)'
        ]
      }
    },
    {
      id: 'scholarship',
      label: 'Government Scholarship Form',
      docType: 'Public Welfare Scholarship Scheme',
      original: {
        heading: 'Memorandum: Post-Matric Merit Assistance Norms FY 26',
        text: 'Beneficiaries domiciled within the State whose cumulative gross household remuneration does not exceed the ceiling of ₹2,50,000/- per annum and who have secured a percentile rank equivalent to not less than 60% in the preceding qualifying examination are instructed to tender Form-7 along with self-attested copies of income certificate issued by an officer not below the rank of Tehsildar, domicile certificate, and bank passbook seeded with Aadhaar number on or before 25th November 2026.'
      },
      transformed: {
        summary: 'State scholarship of up to ₹25,000 is open for students with annual family income under ₹2.5 Lakhs and at least 60% marks in their last exam.',
        keyDates: [
          { date: 'Nov 25, 2026', event: 'Last date to submit Form-7 online' }
        ],
        actions: [
          'Verify family income is below ₹2,50,000 per year',
          'Obtain Income Certificate from Tehsildar office',
          'Ensure bank account is linked to your Aadhaar card',
          'Submit Form-7 with attested documents before Nov 25'
        ]
      }
    },
    {
      id: 'insurance',
      label: 'Insurance Policy Clause',
      docType: 'Health Insurance Policy Terms',
      original: {
        heading: 'Section 4.3 — Exclusions and Specific Waiting Durations',
        text: 'The Company shall not be liable to indemnify any expenditure incurred by the Insured Person in relation to any Pre-Existing Disease or condition declared and/or undeclared, until twenty-four (24) consecutive months of continuous coverage have elapsed since the inception of the first Policy with the Company. Specific treatments specified in Schedule II sub-clause (c) shall further be subjected to a moratorium of 90 days from the policy inception date.'
      },
      transformed: {
        summary: 'Existing illnesses are not covered during your first 2 years of the policy. Specific scheduled treatments require a 90-day waiting period from your policy start date.',
        keyDates: [
          { date: '90 Days', event: 'Waiting period for scheduled surgeries' },
          { date: '24 Months', event: 'Waiting period for pre-existing medical conditions' }
        ],
        actions: [
          'Check Schedule II to see if your required treatment has a 90-day wait',
          'Keep continuous renewals so your 24-month waiting period does not reset'
        ]
      }
    }
  ];

  const current = samples[activeTab];

  return (
    <section className="comparison-section section-spacing">
      <div className="container">
        {/* Section Header */}
        <div className="comparison-header">
          <span className="eyebrow eyebrow--teal">SEE THE DIFFERENCE</span>
          <h2 className="comparison-headline">
            Before and after <span className="headline-accent">Samjho AI.</span>
          </h2>
          <p className="comparison-subtitle">
            Notice the contrast between dense bureaucratic text and the structured, actionable clarity Samjho AI provides.
          </p>

          {/* Sample Tabs */}
          <div className="comparison-tabs">
            {samples.map((sample, idx) => (
              <button
                key={sample.id}
                type="button"
                className={`comparison-tab-btn ${activeTab === idx ? 'comparison-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="comparison-split-grid">
          {/* Left: The Original Confusing Document */}
          <div className="comparison-card comparison-card--original">
            <div className="card-badge-header">
              <span className="doc-pill doc-pill--warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                ORIGINAL DENSE TEXT
              </span>
              <span className="doc-type-label">{current.docType}</span>
            </div>

            <h4 className="original-heading">{current.original.heading}</h4>

            <div className="original-text-box">
              <p className="original-paragraph">{current.original.text}</p>
            </div>

            <div className="original-friction-list">
              <div className="friction-item">
                <span className="friction-icon">✕</span>
                <span>Archaic phrasing and obscure ordinance numbers</span>
              </div>
              <div className="friction-item">
                <span className="friction-icon">✕</span>
                <span>Deadlines buried inside long run-on sentences</span>
              </div>
              <div className="friction-item">
                <span className="friction-icon">✕</span>
                <span>Unclear requirements and hidden late penalties</span>
              </div>
            </div>
          </div>

          {/* Right: The Samjho AI Clarity Output */}
          <div className="comparison-card comparison-card--transformed">
            <div className="card-badge-header">
              <span className="doc-pill doc-pill--success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                SAMJHO AI STRUCTURED CLARITY
              </span>
              <span className="doc-type-label">Clear Action Plan</span>
            </div>

            <div className="clarity-summary-box">
              <span className="clarity-box-label">Plain-Language Summary:</span>
              <p className="clarity-summary-text">{current.transformed.summary}</p>
            </div>

            {/* Key Dates */}
            <div className="clarity-dates-group">
              <span className="clarity-box-label">Important Dates &amp; Fees:</span>
              <div className="clarity-dates-list">
                {current.transformed.keyDates.map((item) => (
                  <div key={item.event} className="clarity-date-row">
                    <span className="date-tag-pill">{item.date}</span>
                    <span className="date-event-text">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Checklist */}
            <div className="clarity-actions-group">
              <span className="clarity-box-label">Action Checklist:</span>
              <div className="clarity-checklist">
                {current.transformed.actions.map((act) => (
                  <div key={act} className="clarity-check-row">
                    <span className="check-icon-circle">✓</span>
                    <span className="check-act-text">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
