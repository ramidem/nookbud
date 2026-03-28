import { DifferentiatorsSection } from '../components/DifferentiatorsSection';
import { FaqSection } from '../components/FaqSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/HeroSection';
import { Nav } from '../components/Nav';
import { PersonasSection } from '../components/PersonasSection';
import { PricingSection } from '../components/PricingSection';
import { RecordSection } from '../components/RecordSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { WhatItIsSection } from '../components/WhatItIsSection';

export default function LandingPage() {
  return (
    <>
      {/* Hero + Nav — fixed background */}
      <div className="fixed inset-0 z-0 flex h-[95svh] flex-col">
        <Nav />
        <HeroSection />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 mt-[95svh]">
        {/* Sticky sections that stack */}
        <div className="sticky top-0 z-[5] h-[95svh]">
          <WhatItIsSection />
        </div>
        <div className="sticky top-0 z-[6] h-[95svh]">
          <RecordSection />
        </div>

        {/* Normal scrolling sections */}
        <div className="relative z-[7]">
          <DifferentiatorsSection />
          <PersonasSection />
          <FeaturesSection />
          <TestimonialsSection />
          <PricingSection />
          <FaqSection />
          <FinalCtaSection />
        </div>
      </div>
      <Footer />
    </>
  );
}
