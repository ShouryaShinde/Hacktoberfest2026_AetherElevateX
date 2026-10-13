import './FinalCTA.css';

export default function FinalCTA({ onScrollToUpload }) {
  const handleCtaClick = () => {
    if (onScrollToUpload) {
      onScrollToUpload();
    } else {
      const el = document.getElementById('upload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="final-cta-section">
      <div className="container">
        <div className="final-cta-card">
          <div className="final-cta-inner">
            <span className="eyebrow eyebrow--teal">START SIMPLIFYING TODAY</span>
            <h2 className="final-cta-heading">
              Every document.<br />
              <span className="final-cta-teal">A little easier to understand.</span>
            </h2>
            <p className="final-cta-copy">
              Start with your next confusing circular, notice, or form today.
              Experience genuine clarity with verified facts and plain-language action steps.
            </p>
            <div className="final-cta-action-row">
              <button
                type="button"
                className="btn btn-primary final-cta-button"
                onClick={handleCtaClick}
              >
                Understand a Document
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
