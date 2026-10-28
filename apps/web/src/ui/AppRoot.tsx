import { buildTokenCss } from '../app/design/_data/tokens';

const ROOT_ID = 'app-root';

/** The token-styled root every app screen sits in. Follows the system light or dark setting. */
export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="nb-root min-h-dvh" id={ROOT_ID}>
      <style>{buildTokenCss(`#${ROOT_ID}`)}</style>
      {children}
    </div>
  );
}
