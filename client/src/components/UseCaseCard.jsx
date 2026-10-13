import './UseCaseCard.css';

export function UseCaseCard({ icon, tag, title, description, isFeatured = false, linkText = 'Explore use case' }) {
  return (
    <div className={`use-case-card card-clean ${isFeatured ? 'use-case-card--featured' : ''}`}>
      <div className="card-top-row">
        <div className="use-case-icon-box">
          {icon}
        </div>
        <span className={`badge-chip ${isFeatured ? 'badge-chip--teal' : ''}`}>{tag}</span>
      </div>

      <h3 className="use-case-title">{title}</h3>
      <p className="use-case-description">{description}</p>

      <div className="use-case-footer-link">
        <a href="#upload-section" className="use-case-anchor">
          <span>{linkText}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function UseCasesSection() {
  const useCases = [
    {
      id: 'college',
      tag: 'ACADEMICS',
      title: 'College & Education',
      description: 'Understand circulars, examination notices, assignment instructions, and scholarship requirements.',
      isFeatured: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    },
    {
      id: 'government',
      tag: 'PUBLIC SERVICES',
      title: 'Government & Public Services',
      description: 'Simplify official notices, forms, eligibility criteria, and application requirements.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )
    },
    {
      id: 'insurance',
      tag: 'POLICIES',
      title: 'Insurance & Policies',
      description: 'Understand coverage, exclusions, claim conditions, and important clauses without hidden surprises.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      id: 'bills',
      tag: 'FINANCES',
      title: 'Bills & Payments',
      description: 'Identify itemized charges, recurring fees, penalty clauses, due dates, and transparent payment terms.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      id: 'jobs',
      tag: 'CAREERS',
      title: 'Jobs & Applications',
      description: 'Understand job notifications, selection timelines, eligibility requirements, and required documents.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      id: 'everyday',
      tag: 'AGREEMENTS',
      title: 'Everyday Documents',
      description: 'Make letters, contracts, warranties, user instructions, and lengthy agreements simple and accessible.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    }
  ];

  return (
    <section id="use-cases" className="use-cases-section section-spacing">
      <div className="container">
        {/* Section Header */}
        <div className="use-cases-header-row">
          <div>
            <span className="eyebrow">PRACTICAL APPLICATIONS</span>
            <h2 className="use-cases-headline">
              Understand what <span className="headline-accent">matters.</span>
            </h2>
          </div>
          <p className="use-cases-lead">
            Official announcements and contracts are filled with bureaucratic jargon.
            Samjho AI extracts what you actually need to know so you never miss an opportunity or deadline.
          </p>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="use-cases-grid">
          {useCases.map((uc) => (
            <UseCaseCard
              key={uc.id}
              tag={uc.tag}
              title={uc.title}
              description={uc.description}
              isFeatured={uc.isFeatured}
              icon={uc.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
