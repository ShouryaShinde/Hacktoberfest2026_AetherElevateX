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
        {/* Left Side: Confident Editorial Typography */}
        <div className="hero-content">
          <div className="eyebrow hero-eyebrow">
            <span className="eyebrow-dot" />
            DOCUMENT UNDERSTANDING, MADE SIMPLE
          </div>

          <h1 className="hero-headline">
            Complex information.<br />
            <span className="hero-highlight">Clear understanding.</span>
          </h1>

          <p className="hero-description">
            Understand notices, college circulars, insurance policies, forms, and important documents in simple language.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary hero-cta"
              onClick={handleScrollToUpload}
            >
              Understand a Document
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
              Simple explanations · Supported languages · Document-based answers
            </span>
          </div>
        </div>

        {/* Right Side: Interactive Document Upload Panel */}
        <div className="hero-upload-column">
          <DocumentUploader />
        </div>
      </div>
    </section>
  );
}
