import { Audience } from '../landing/Audience';
import { Closing } from '../landing/Closing';
import { Faq } from '../landing/Faq';
import { Footer } from '../landing/Footer';
import { Hero } from '../landing/Hero';
import { Manifesto } from '../landing/Manifesto';
import { Nav } from '../landing/Nav';
import { Records } from '../landing/Records';
import { buildTokenCss } from './design/_data/tokens';

const ROOT_ID = 'landing-root';

export default function LandingPage() {
  return (
    <div className="nb-root" data-theme="light" id={ROOT_ID}>
      <style>{buildTokenCss(`#${ROOT_ID}`)}</style>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        href="#main"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Records />
        <Manifesto />
        <Audience />
        <Faq />
      </main>
      <Closing />
      <Footer />
    </div>
  );
}
