import DocumentUploader from './DocumentUploader';
import './HeroSection.css';

export default function HeroSection({ onScrollToUpload, onScrollToHowItWorks }) {
  const handleScrollToHowItWorks = () => {
    if (onScrollToHowItWorks) {
      onScrollToHowItWorks();
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToUpload = () => {
    if (onScrollToUpload) {
      onScrollToUpload();
    } else {
      const el = document.getElementById('upload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section">
      <div className="container hero-container">
        {/* Editorial Headline Header */}
        <div className="hero-header-block">
          <div className="eyebrow hero-eyebrow">
            <span className="eyebrow-dot" />
            DOCUMENT UNDERSTANDING, MADE SIMPLE
          </div>

          <h1 className="hero-headline">
            Complex information. <span className="hero-highlight">Clear understanding.</span>
          </h1>

          <p className="hero-description">
            Upload notices, circulars, insurance clauses, forms, or bills. Experience live in-memory execution and verified factual grounding.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary hero-cta"
              onClick={handleScrollToUpload}
            >
              Analyze a Document
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn-secondary hero-secondary-btn"
              onClick={handleScrollToHowItWorks}
            >
              See How It Works
            </button>
          </div>

          <div className="hero-supporting-line">
            <span className="supporting-check">✓</span>
            <span className="supporting-text">
              Multer In-Memory Processing ·Gemma 4 31B Instruct · Zero Hallucination Grounding
            </span>
          </div>
        </div>

        {/* Studio Window: Multer Upload on Left, Execution Cycle & Proper Content on Right */}
        <div className="hero-workspace-full">
          <DocumentUploader />
        </div>
      </div>
    </section>
  );
}
