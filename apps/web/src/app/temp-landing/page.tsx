import type { Metadata } from 'next';
import { Source_Serif_4 } from 'next/font/google';
import { TempLanding } from '../../temp-landing/TempLanding';
import { buildTokenCss } from '../design/_data/tokens';

const sourceSerif = Source_Serif_4({
  display: 'swap',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-temp-serif',
});

const ROOT_ID = 'temp-landing';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Nookbud — temp landing',
};

export default function TempLandingPage() {
  return (
    <div className={`nb-root ${sourceSerif.variable}`} data-theme="light" id={ROOT_ID}>
      <style>{`${buildTokenCss(`#${ROOT_ID}`)}
#${ROOT_ID} .display{font-family:var(--font-temp-serif),Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-0.04em}
@media (prefers-reduced-motion:no-preference){html:has(#${ROOT_ID}){scroll-behavior:smooth}}`}</style>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        href="#main"
      >
        Skip to content
      </a>
      <TempLanding />
    </div>
  );
}
