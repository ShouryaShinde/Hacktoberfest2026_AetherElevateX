import { useState } from 'react';
import './LanguageSection.css';

export default function LanguageSection() {
  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      status: 'SUPPORTED',
      badgeClass: 'badge-chip--success',
      statusLabel: 'Phase 1 Active',
      sampleSummary: 'All semester exam fee payments must be completed online by November 3, 2026. Late submissions carry a ₹500 penalty.',
      script: 'Latin'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      status: 'EVALUATION',
      badgeClass: 'badge-chip--teal',
      statusLabel: 'Evaluation Target',
      sampleSummary: 'सभी सेमेस्टर परीक्षा शुल्क का भुगतान 3 नवंबर, 2026 तक ऑनलाइन किया जाना चाहिए। विलंब शुल्क ₹500 लागू होगा।',
      script: 'Devanagari'
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      status: 'EVALUATION',
      badgeClass: 'badge-chip--teal',
      statusLabel: 'Evaluation Target',
      sampleSummary: 'सर्व सेमिस्टर परीक्षा फी भरणे 3 नोव्हेंबर 2026 पर्यंत ऑनलाइन पूर्ण करणे आवश्यक आहे. उशिरा भरल्यास ₹500 दंड आकारला जाईल.',
      script: 'Devanagari'
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      status: 'PLANNED',
      badgeClass: 'badge-chip',
      statusLabel: 'Roadmap P1',
      sampleSummary: 'সমস্ত সেমিস্টার পরীক্ষার ফি ৩ নভেম্বর, ২০২৬ এর মধ্যে অনলাইনে জমা দিতে হবে। বিলম্ব ফি ₹৫০০ প্রযোজ্য।',
      script: 'Bengali'
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      status: 'PLANNED',
      badgeClass: 'badge-chip',
      statusLabel: 'Roadmap P1',
      sampleSummary: 'அனைத்து செமஸ்டர் தேர்வு கட்டணமும் நவம்பர் 3, 2026க்குள் ஆன்லைனில் செலுத்தப்பட வேண்டும். தாமத கட்டணம் ₹500 விதிக்கப்படும்.',
      script: 'Tamil'
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      status: 'PLANNED',
      badgeClass: 'badge-chip',
      statusLabel: 'Roadmap P1',
      sampleSummary: 'అన్ని సెమిస్టర్ పరీక్ష రుసుము చెల్లింపులు నవంబర్ 3, 2026 నాటికి ఆన్‌లైన్‌లో పూర్తి చేయాలి. ఆలస్య రుసుము ₹500 వర్తిస్తుంది.',
      script: 'Telugu'
    }
  ];

  const [activeLang, setActiveLang] = useState(languages[0]);

  return (
    <section id="languages" className="languages-section section-spacing">
      <div className="container">
        {/* Section Header */}
        <div className="languages-header-row">
          <div>
            <span className="eyebrow">MULTILINGUAL ACCESSIBILITY</span>
            <h2 className="languages-headline">
              Understand it in <span className="headline-accent">your language.</span>
            </h2>
          </div>
          <p className="languages-lead">
            Official announcements are difficult enough. You shouldn&apos;t need to decode them in an unfamiliar language.
            Samjho AI is engineered to provide authentic, culturally grounded regional language explanations.
          </p>
        </div>

        {/* Language Grid Selector */}
        <div className="languages-card-grid">
          {languages.map((lang) => {
            const isSelected = activeLang.code === lang.code;
            return (
              <div
                key={lang.code}
                className={`language-select-card card-clean ${isSelected ? 'language-select-card--selected' : ''}`}
                onClick={() => setActiveLang(lang)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveLang(lang);
                  }
                }}
              >
                <div className="lang-header">
                  <span className={`badge-chip ${lang.badgeClass}`}>
                    {lang.statusLabel}
                  </span>
                  <span className="lang-script-text">{lang.script}</span>
                </div>

                <div className="lang-typography">
                  <span className="lang-native-text">{lang.nativeName}</span>
                  <span className="lang-english-text">{lang.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Interactive Sample Preview */}
        <div className="language-preview-container card-clean">
          <div className="preview-meta-row">
            <div className="preview-active-tag">
              <span className="badge-chip badge-chip--teal">LIVE PREVIEW</span>
              <strong className="preview-lang-name">
                {activeLang.name} ({activeLang.nativeName})
              </strong>
            </div>
            <span className="preview-status-pill">
              {activeLang.status === 'SUPPORTED'
                ? '✓ Active MVP inference target'
                : activeLang.status === 'EVALUATION'
                ? '⚡ Evaluation dataset in progress (Phase 3)'
                : '⌛ Planned in future milestone'}
            </span>
          </div>

          <div className="preview-sample-quote">
            <span className="preview-sample-label">Extracted Summary Sample:</span>
            <p className="preview-sample-text">{activeLang.sampleSummary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
