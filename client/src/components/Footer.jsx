import './Footer.css';

export default function Footer({ onScrollToUpload }) {
  const handleScroll = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col-brand">
            <div className="footer-logo">
              <div className="footer-symbol">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="14" height="18" rx="3" fill="#4C63D9" />
                  <path d="M11 3L17 9H13C11.8954 9 11 8.10457 11 7V3Z" fill="#3549B4" />
                  <circle cx="16.5" cy="16.5" r="4.5" fill="#65D6C0" />
                </svg>
              </div>
              <span className="footer-brand-title">Samjho AI</span>
            </div>
            <p className="footer-tagline-text">
              Complex Information. Clear Understanding.
            </p>
            <p className="footer-about-text">
              An open-source document understanding platform designed to help students,
              parents, and everyday citizens turn dense official notices into simple, actionable next steps.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer-col-nav">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#hero" onClick={(e) => handleScroll(e, 'hero')}>Home</a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')}>How It Works</a>
              </li>
              <li>
                <a href="#use-cases" onClick={(e) => handleScroll(e, 'use-cases')}>Use Cases</a>
              </li>
              <li>
                <a href="#languages" onClick={(e) => handleScroll(e, 'languages')}>Languages</a>
              </li>
              <li>
                <a href="#product-preview" onClick={(e) => handleScroll(e, 'product-preview')}>Product Preview</a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleScroll(e, 'features')}>Features</a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleScroll(e, 'faq')}>FAQ</a>
              </li>
            </ul>
          </div>

          {/* Core Principles */}
          <div className="footer-col-nav">
            <h4 className="footer-heading">Core Principles</h4>
            <ul className="footer-nav-list">
              <li><span>Grounded facts over confident guesses</span></li>
              <li><span>In-memory processing by default</span></li>
              <li><span>Zero permanent document storage</span></li>
              <li><span>Multilingual cultural fidelity</span></li>
            </ul>
          </div>

          {/* Quick Action */}
          <div className="footer-col-action">
            <h4 className="footer-heading">Get Started</h4>
            <p className="footer-cta-desc">
              Ready to test a circular or public notice?
            </p>
            <button
              type="button"
              className="btn btn-primary footer-upload-btn"
              onClick={onScrollToUpload}
            >
              Upload Document
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-row">
          <p className="footer-copy-text">
            © 2026 Samjho AI · Privacy-First Document Intelligence.
          </p>
          <div className="footer-privacy-pill">
            <span className="badge-chip badge-chip--teal">IN-MEMORY PROCESSING ONLY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
