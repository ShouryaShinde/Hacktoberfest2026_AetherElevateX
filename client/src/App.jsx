import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ComparisonSection from './components/ComparisonSection';
import UseCasesSection from './components/UseCaseCard';
import HowItWorks from './components/HowItWorks';
import LanguageSection from './components/LanguageSection';
import ProductPreview from './components/ProductPreview';
import FeaturesSection from './components/FeaturesSection';
import FAQSection from './components/FAQSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import './App.css';

function App() {
  const scrollToUpload = () => {
    const el = document.getElementById('upload-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const dropzone = el.querySelector('.dropzone-modern');
      if (dropzone) {
        dropzone.focus();
      }
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. Refined Navigation Bar */}
      <Navbar onScrollToUpload={scrollToUpload} />

      {/* Main Content Sections */}
      <main>
        {/* 2. Hero Section with Interactive Document Upload Panel */}
        <HeroSection
          onScrollToUpload={scrollToUpload}
          onScrollToHowItWorks={scrollToHowItWorks}
        />

        {/* 3. Before vs After Document Comparison */}
        <ComparisonSection />

        {/* 4. Use Cases Grid */}
        <UseCasesSection />

        {/* 5. Three-Step How It Works Flow */}
        <HowItWorks />

        {/* 6. Multilingual Language Accessibility */}
        <LanguageSection />

        {/* 7. Realistic Workspace & Document Breakdown Preview */}
        <ProductPreview />

        {/* 8. Structured Engineered Features Grid */}
        <FeaturesSection />

        {/* 9. Frequently Asked Questions */}
        <FAQSection />

        {/* 10. Midnight Navy Final CTA */}
        <FinalCTA onScrollToUpload={scrollToUpload} />
      </main>

      {/* 11. Accessible Midnight Navy Footer */}
      <Footer onScrollToUpload={scrollToUpload} />

      {/* 12. Floating Quick Actions Bar */}
      <BackToTop onScrollToUpload={scrollToUpload} />
    </div>
  );
}

export default App;
