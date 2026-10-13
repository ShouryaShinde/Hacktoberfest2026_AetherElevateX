import './FeaturesSection.css';

export default function FeaturesSection() {
  const features = [
    {
      id: 'plain-language',
      title: 'Plain-Language Explanations',
      description: 'Translates dense legal, bureaucratic, and academic prose into simple, everyday language without losing critical nuance.',
      status: 'UI READY',
      statusClass: 'badge-chip--success',
      note: 'Client interface & schemas ready',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      id: 'dates-requirements',
      title: 'Key Dates, Fees & Deadlines',
      description: 'Instantly identifies deadlines, cutoff times, eligibility criteria, and fee structures so you never miss an application window.',
      status: 'UI READY',
      statusClass: 'badge-chip--success',
      note: 'Structured date contracts defined',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: 'grounded-qa',
      title: 'Document-Based Questions',
      description: 'Answers your questions strictly using facts present inside the uploaded document. Zero hallucinated rules or guessed conditions.',
      status: 'PHASE 3 ADAPTER',
      statusClass: 'badge-chip--teal',
      note: 'Gemma 4 prompt pipeline designed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      id: 'evidence-citations',
      title: 'Passage-Linked Answers',
      description: 'Every generated answer links back to specific text chunks and page excerpts so you can verify the original source for yourself.',
      status: 'PHASE 5 CONTRACT',
      statusClass: 'badge-chip--teal',
      note: 'Chunk grounding schema mapped',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )
    },
    {
      id: 'text-to-speech',
      title: 'Text-to-Speech Playback',
      description: 'Listen to spoken explanations of notice summaries and checklist items for greater accessibility on mobile devices.',
      status: 'PLANNED P1',
      statusClass: 'badge-chip',
      note: 'Speech synthesis roadmap item',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )
    },
    {
      id: 'multilingual-support',
      title: 'Multilingual Understanding',
      description: 'Engineered to understand and explain documents across Indian languages including English, Hindi, and Marathi with cultural fidelity.',
      status: 'IN EVALUATION',
      statusClass: 'badge-chip--teal',
      note: 'Regional evaluation set prepared',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="features-section section-spacing">
      <div className="container">
        <div className="features-header-row">
          <div>
            <span className="eyebrow">ENGINEERED FOR TRUST</span>
            <h2 className="features-headline">
              Built differently than <span className="headline-accent">generic chatbots.</span>
            </h2>
          </div>
          <p className="features-lead">
            Samjho AI doesn&apos;t invent answers. Every architectural decision is grounded in strict schema validation,
            private in-memory processing, and transparent verification.
          </p>
        </div>

        <div className="features-grid-cards">
          {features.map((feat) => (
            <div key={feat.id} className="feature-item-card card-clean">
              <div className="feature-top-status">
                <div className="feature-icon-container">
                  {feat.icon}
                </div>
                <span className={`badge-chip ${feat.statusClass}`}>
                  {feat.status}
                </span>
              </div>

              <h3 className="feature-item-title">{feat.title}</h3>
              <p className="feature-item-description">{feat.description}</p>

              <div className="feature-bottom-note">
                <span className="note-bullet">▪</span>
                <span className="note-text">{feat.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
