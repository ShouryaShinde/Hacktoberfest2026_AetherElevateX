import { useState } from 'react';
import './FAQSection.css';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does Samjho AI guarantee that it does not hallucinate facts?',
      a: 'Unlike generic chatbots that guess, Samjho AI uses a strict schema-constrained prompt architecture. The model is explicitly instructed to extract only facts, dates, and conditions directly present in your document. Every factual claim is mapped back to verifiable text chunk IDs and page references. If a detail (like a deadline or amount) is absent from the text, the system explicitly marks it as unknown rather than fabricating an answer.'
    },
    {
      q: 'Are my uploaded documents saved or used for AI model training?',
      a: 'No. Strictly by default, Samjho AI does not store user documents in a permanent database. Files are processed in-memory during your active session and discarded automatically once the temporary session expires. Your personal paperwork is never used to train foundation models.'
    },
    {
      q: 'Which Indian regional languages are supported?',
      a: 'English is fully active in Phase 1. Hindi (हिन्दी) and Marathi (मराठी) are actively undergoing evaluation in Phase 3 using curated circular datasets to ensure high translation accuracy. Additional languages including Bengali, Tamil, and Telugu are planned on our engineering roadmap.'
    },
    {
      q: 'Can I upload photos of physical circulars taken with a phone camera?',
      a: 'Yes. In addition to PDF documents, the upload pipeline accepts JPG, JPEG, and PNG image files (up to 10 MB). The upcoming OCR pipeline will extract text from smartphone photos of noticeboards, physical circulars, and printed forms.'
    },
    {
      q: 'Does Samjho AI automatically submit forms or make official decisions?',
      a: 'No. Samjho AI is strictly an explanatory comprehension assistant. It clarifies what documents require, identifies prerequisites, and provides actionable checklists. It does not provide legal advice, guarantee eligibility approval, or submit official applications on your behalf.'
    },
    {
      q: 'Is Samjho AI open-source and free to use?',
      a: 'Yes. Samjho AI is built as a privacy-first, community-driven open-source project under Hacktoberfest 2026. The full specification, architecture, and code contracts are openly documented in the repository.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="faq-section section-spacing">
      <div className="container">
        <div className="faq-header">
          <span className="eyebrow">COMMON QUESTIONS</span>
          <h2 className="faq-headline">
            Frequently asked <span className="headline-accent">questions.</span>
          </h2>
          <p className="faq-subtitle">
            Everything you need to know about document comprehension, data privacy, and language support.
          </p>
        </div>

        <div className="faq-accordion-container">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className={`faq-item card-clean ${isOpen ? 'faq-item--open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  <div className={`faq-toggle-icon ${isOpen ? 'faq-toggle-icon--open' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="faq-answer-panel">
                    <p className="faq-answer-text">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
