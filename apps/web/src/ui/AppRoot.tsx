import { buildTokenCss } from '../app/design/_data/tokens';

const ROOT_ID = 'app-root';

/**
 * The token-styled root every app screen sits in. Light only for now, like the landing page:
 * `subtitle` has no dark value and would drop below 4.5:1 on the dark background (R18).
 */
export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="nb-root min-h-dvh" data-theme="light" id={ROOT_ID}>
      <style>{buildTokenCss(`#${ROOT_ID}`)}</style>
      {children}
    </div>
  );
}
