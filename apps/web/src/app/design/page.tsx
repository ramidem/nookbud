import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import type { CSSProperties } from 'react';

import { icons, illustrations } from './_data/assets';
import { guidelines } from './_data/guidelines';
import {
  buildTokenCss,
  colorTokens,
  controlHeightTokens,
  cssVar,
  darkValue,
  lightValue,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  type Token,
  typeGroups,
} from './_data/tokens';
import styles from './design.module.css';
import { ThemeToggle } from './theme-toggle';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  description: 'Colors, type, spacing and assets for building Nookbud.',
  title: 'Design system · Nookbud',
};

const ROOT_ID = 'nookbud-design';

const COLOR_GROUPS: { names: string[]; title: string }[] = [
  { names: ['primary', 'primary-pressed', 'accent', 'accent-soft', 'secondary'], title: 'Brand' },
  {
    names: [
      'background',
      'foreground',
      'surface',
      'surface-raised',
      'sheet',
      'subtitle',
      'placeholder',
      'muted',
      'divider',
      'border',
      'border-strong',
      'disabled',
      'overlay',
      'underlay',
    ],
    title: 'Surfaces & text',
  },
  {
    names: [
      'tint-sage',
      'tint-terracotta',
      'tint-rose',
      'tint-taupe',
      'tint-sage-bold',
      'home-a',
      'home-b',
    ],
    title: 'Card tints',
  },
  { names: ['error', 'warning', 'success'], title: 'Feedback' },
  { names: ['kbd-button', 'kbd-surface', 'white', 'black'], title: 'Utility' },
];

const neutralTokens = colorTokens.filter((t) => t.name.startsWith('neutral-'));
const byName = new Map(colorTokens.map((t) => [t.name, t]));

const SECTIONS = ['Guidelines', 'Color', 'Type', 'Spacing', 'Radius', 'Elevation', 'Icons', 'Logo'];

const cssVarRef = (name: string) => `var(${cssVar(name)})`;

function Swatch({ token }: { token: Token }) {
  const light = lightValue(token.value);
  const dark = darkValue(token.value);
  return (
    <li className={styles.swatch}>
      <span className={styles.swatchChip} style={{ background: cssVarRef(token.name) }} />
      <span className={styles.swatchName}>{token.name}</span>
      <span className={styles.swatchValue}>
        {light}
        {dark !== light ? ` · ${dark}` : ''}
      </span>
      {token.usage ? <span className={styles.swatchUsage}>{token.usage}</span> : null}
    </li>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className={styles.section} id={title.toLowerCase()}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function renderInlineCode(text: string) {
  return text
    .split('`')
    .map((part, i) => (i % 2 === 1 ? <code key={part + i}>{part}</code> : part));
}

export default function DesignPage() {
  return (
    <div className={`${styles.root} ${inter.variable}`} id={ROOT_ID}>
      <style>{buildTokenCss(`#${ROOT_ID}`)}</style>

      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            alt="Nookbud"
            className={styles.brandMark}
            height={56}
            src="/design/logos/nookbud-app-icon.png"
            width={56}
          />
          <div>
            <h1 className={styles.title}>Nookbud</h1>
            <p className={styles.tagline}>The safe corner where your child grows.</p>
          </div>
        </div>
        <ThemeToggle targetId={ROOT_ID} />
      </header>

      <nav aria-label="Sections" className={styles.nav}>
        {SECTIONS.map((s) => (
          <a href={`#${s.toLowerCase()}`} key={s}>
            {s}
          </a>
        ))}
      </nav>

      <main className={styles.main}>
        <Section title="Guidelines">
          <div className={styles.guidelines}>
            {guidelines.map((g) => (
              <div className={styles.guideline} key={g.title}>
                <h3 className={styles.subTitle}>{g.title}</h3>
                <ul>
                  {g.rules.map((rule) => (
                    <li key={rule}>{renderInlineCode(rule)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Color">
          {COLOR_GROUPS.map((group) => (
            <div className={styles.group} key={group.title}>
              <h3 className={styles.subTitle}>{group.title}</h3>
              <ul className={styles.swatches}>
                {group.names
                  .map((n) => byName.get(n))
                  .filter((t): t is Token => Boolean(t))
                  .map((t) => (
                    <Swatch key={t.name} token={t} />
                  ))}
              </ul>
            </div>
          ))}
          <div className={styles.group}>
            <h3 className={styles.subTitle}>Neutral scale</h3>
            <ul className={styles.scale}>
              {neutralTokens.map((t) => (
                <li key={t.name} title={t.usage}>
                  <span style={{ background: cssVarRef(t.name) }} />
                  <strong>{t.name.replace('neutral-', '')}</strong>
                  <em>{lightValue(t.value)}</em>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section title="Type">
          {typeGroups.map((group) => (
            <div className={styles.group} key={group.name}>
              <h3 className={styles.subTitle}>{group.name} · Inter</h3>
              <ul className={styles.typeList}>
                {group.styles.map((s) => {
                  const style: CSSProperties = {
                    fontFamily: `var(--font-${s.family ?? group.family})`,
                    fontSize: s.fontSize,
                    fontWeight: s.fontWeight,
                    letterSpacing: s.letterSpacing,
                    lineHeight: s.lineHeight,
                  };
                  return (
                    <li className={styles.typeRow} key={s.name}>
                      <span style={style}>Here&apos;s today. Here&apos;s what&apos;s next.</span>
                      <span className={styles.typeMeta}>
                        <strong>{s.name}</strong> {s.fontSize}/{s.lineHeight} · {s.fontWeight}
                        {s.letterSpacing ? ` · ${s.letterSpacing}` : null}
                        {s.usage ? <em>{s.usage}</em> : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="Spacing">
          <ul className={styles.bars}>
            {spacingTokens.map((t) => (
              <li key={t.name}>
                <span className={styles.bar} style={{ width: cssVarRef(t.name) }} />
                <strong>{t.name}</strong>
                <em>
                  {lightValue(t.value)} · {t.usage}
                </em>
              </li>
            ))}
          </ul>
          <h3 className={styles.subTitle}>Control heights</h3>
          <ul className={styles.bars}>
            {controlHeightTokens.map((t) => (
              <li key={t.name}>
                <span className={styles.control} style={{ height: cssVarRef(t.name) }} />
                <strong>{t.name}</strong>
                <em>{lightValue(t.value)}</em>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Radius">
          <ul className={styles.tiles}>
            {radiusTokens.map((t) => (
              <li key={t.name}>
                <span className={styles.radiusTile} style={{ borderRadius: cssVarRef(t.name) }} />
                <strong>{t.name}</strong>
                <em>{lightValue(t.value)}</em>
                <small>{t.usage}</small>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Elevation">
          <ul className={styles.tiles}>
            {shadowTokens.map((t) => (
              <li key={t.name}>
                <span className={styles.shadowTile} style={{ boxShadow: cssVarRef(t.name) }} />
                <strong>{t.name}</strong>
                <small>{t.usage}</small>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Icons">
          <p className={styles.note}>
            Lucide outline, 24px, stroke 2, drawn in <code>currentColor</code>. Shown in{' '}
            <code>foreground</code>.
          </p>
          <ul className={styles.icons}>
            {icons.map((name) => (
              <li key={name} title={name}>
                <span
                  className={styles.icon}
                  style={{
                    maskImage: `url(/design/icons/${name}.svg)`,
                    WebkitMaskImage: `url(/design/icons/${name}.svg)`,
                  }}
                />
                <small>{name}</small>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Logo">
          <div className={styles.logos}>
            <Image
              alt="Nookbud app mark"
              height={160}
              src="/design/logos/nookbud-app-icon.png"
              width={160}
            />
            <p className={styles.note}>
              Use the mark as provided. No recoloring, no gradients, no redrawing.
            </p>
          </div>
          <h3 className={styles.subTitle}>Illustrations</h3>
          <ul className={styles.illustrations}>
            {illustrations.map((name) => (
              <li key={name}>
                <Image
                  alt=""
                  height={160}
                  src={`/design/illustrations/${name}.svg`}
                  unoptimized
                  width={240}
                />
              </li>
            ))}
          </ul>
        </Section>
      </main>
    </div>
  );
}
