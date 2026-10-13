import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UseCasesSection from './components/UseCaseCard';
import HowItWorks from './components/HowItWorks';
import LanguageSection from './components/LanguageSection';
import ProductPreview from './components/ProductPreview';
import FeaturesSection from './components/FeaturesSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
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
        {/* 2. Hero Section with Document Upload Panel */}
        <HeroSection
          onScrollToUpload={scrollToUpload}
          onScrollToHowItWorks={scrollToHowItWorks}
        />

        {/* 3. Use Cases Grid */}
        <UseCasesSection />

        {/* 4. Three-Step How It Works Flow */}
        <HowItWorks />

        {/* 5. Multilingual Language Accessibility */}
        <LanguageSection />

        {/* 6. Realistic Workspace & Document Breakdown Preview */}
        <ProductPreview />

        {/* 7. Structured Engineered Features Grid */}
        <FeaturesSection />

        {/* 8. Midnight Navy Final CTA */}
        <FinalCTA onScrollToUpload={scrollToUpload} />
      </main>

      {/* 9. Accessible Midnight Navy Footer */}
      <Footer onScrollToUpload={scrollToUpload} />
    </div>
  );
}

export default App;
