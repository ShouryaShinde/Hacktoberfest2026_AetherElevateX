import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ onScrollToUpload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Languages', href: '#languages' },
    { label: 'Preview', href: '#product-preview' },
    { label: 'Features', href: '#features' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCtaClick = () => {
    setMobileMenuOpen(false);
    if (onScrollToUpload) {
      onScrollToUpload();
    } else {
      const el = document.getElementById('upload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Original Samjho AI Brand Symbol & Wordmark */}
        <a href="#hero" className="brand-link" onClick={(e) => handleLinkClick(e, '#hero')}>
          <div className="brand-symbol">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* Document Base */}
              <rect x="3" y="3" width="14" height="18" rx="3" fill="#4C63D9" />
              {/* Folded Corner Accent */}
              <path d="M11 3L17 9H13C11.8954 9 11 8.10457 11 7V3Z" fill="#3549B4" />
              {/* Clarifying Speech / Understanding Notch in Mint Teal */}
              <circle cx="16.5" cy="16.5" r="4.5" fill="#65D6C0" />
              <path d="M15 16.5H18M16.5 15V18" stroke="#101C35" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="brand-wordmark">Samjho AI</span>
          <span className="brand-tag">BETA</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.label} className="nav-item">
                <a
                  href={link.href}
                  className="nav-link"
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Action */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-primary nav-cta"
            onClick={handleCtaClick}
          >
            Understand a Document
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <ul className="mobile-nav-list">
            {navLinks.map((link) => (
              <li key={link.label} className="mobile-nav-item">
                <a
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mobile-nav-item cta-wrapper">
              <button
                type="button"
                className="btn btn-primary mobile-cta"
                onClick={handleCtaClick}
              >
                Understand a Document
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
