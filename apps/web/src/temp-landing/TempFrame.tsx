import { Source_Serif_4 } from 'next/font/google';
import { buildTokenCss } from '../app/design/_data/tokens';

const sourceSerif = Source_Serif_4({
  display: 'swap',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-temp-serif',
});

/** Shared type and color frame for the layout trials. The locked page does not use this. */
export function TempFrame({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className={`nb-root ${sourceSerif.variable}`} data-theme="light" id={id}>
      <style>{`${buildTokenCss(`#${id}`)}
#${id} .display{font-family:var(--font-temp-serif),Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-0.04em}
@media (prefers-reduced-motion:no-preference){html:has(#${id}){scroll-behavior:smooth}}`}</style>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        href="#main"
      >
        Skip to content
      </a>
      {children}
    </div>
  );
}
