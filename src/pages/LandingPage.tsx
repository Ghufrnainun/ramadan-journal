import {
  Navbar,
  HeroSection,
  TonightFocusSection,
  ProblemSection,
  PromiseSection,
  PreviewSection,
  DailyFlowSection,
  FeaturesSection,
  StreakSection,
  RemindersSection,
  PrivacySection,
  FAQSection,
  CTASection,
  Footer,
  StickyMobileCTA,
} from '@/components/landing';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <main>
        <HeroSection />
        <TonightFocusSection />
        <ProblemSection />
        <PromiseSection />
        <PreviewSection />
        <DailyFlowSection />
        <FeaturesSection />
        <StreakSection />
        <RemindersSection />
        <PrivacySection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default LandingPage;
