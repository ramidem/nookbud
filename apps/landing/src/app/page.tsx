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
      <Nav />
      <main>
        <HeroSection />
        <WhatItIsSection />
        <RecordSection />
        <DifferentiatorsSection />
        <PersonasSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
