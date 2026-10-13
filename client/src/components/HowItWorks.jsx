import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      stepNumber: '01',
      title: 'Upload',
      subtitle: 'Choose a PDF or supported image.',
      description: 'Upload your notice, circular, or policy document. The client validates the file size and format with privacy preserved in-memory.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      )
    },
    {
      stepNumber: '02',
      title: 'Understand',
      subtitle: 'Get a plain-language explanation of important information.',
      description: 'Complex legalese is structured into key points, mandatory checklists, critical deadlines, and amounts that matter to you.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    },
    {
      stepNumber: '03',
      title: 'Ask & Listen',
      subtitle: 'Ask questions and listen to explanations when available.',
      description: 'Ask specific questions grounded strictly in the document text, complete with verified page citations and future audio playback.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="how-section section-spacing">
      <div className="container">
        <div className="how-header">
          <span className="eyebrow">SIMPLE THREE-STEP WORKFLOW</span>
          <h2 className="how-headline">
            From confusion to <span className="headline-accent">clarity.</span>
          </h2>
          <p className="how-lead">
            No convoluted setup. Upload any official document and receive a structured breakdown in seconds.
          </p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step) => (
            <div key={step.stepNumber} className="how-step-card card-clean">
              <div className="step-card-top">
                <span className="step-number-tag">{step.stepNumber}</span>
                <div className="step-icon-wrapper">
                  {step.icon}
                </div>
              </div>

              <h3 className="step-title">{step.title}</h3>
              <p className="step-subtitle">{step.subtitle}</p>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
