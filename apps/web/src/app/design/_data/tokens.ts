import data from './tokens.json';

export type ThemedValue = string | { light: string; dark?: string };

export type Token = { name: string; value: ThemedValue; usage?: string };

export type TypeStyle = {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  family?: string;
  usage?: string;
};

export type TypeGroup = { name: string; family: string; styles: TypeStyle[] };

export const colorTokens = data.color.tokens as Token[];
export const typeGroups = data.type.groups as TypeGroup[];
export const spacingTokens = data.spacing.tokens as Token[];
export const radiusTokens = data.radius.tokens as Token[];
export const shadowTokens = data.shadow.tokens as Token[];
export const controlHeightTokens = data['control-height'].tokens as Token[];

export const lightValue = (value: ThemedValue) => (typeof value === 'string' ? value : value.light);

export const darkValue = (value: ThemedValue) =>
  typeof value === 'string' ? value : (value.dark ?? value.light);

/** Escapes a token name for use as a CSS custom property (e.g. `space-1.5` → `space-1\.5`). */
export const cssVar = (name: string) => `--${name.replace(/\./g, '\\.')}`;

/**
 * Builds the CSS custom properties for every token, scoped to `selector`.
 * Light is the default; dark applies with `data-theme="dark"` or, when no theme is forced,
 * with the system dark preference.
 */
export function buildTokenCss(selector: string): string {
  const light = colorTokens.map((t) => `${cssVar(t.name)}:${lightValue(t.value)};`).join('');
  const dark = colorTokens
    .filter((t) => typeof t.value !== 'string' && t.value.dark)
    .map((t) => `${cssVar(t.name)}:${darkValue(t.value)};`)
    .join('');
  const scales = [...spacingTokens, ...radiusTokens, ...shadowTokens, ...controlHeightTokens]
    .map((t) => `${cssVar(t.name)}:${lightValue(t.value)};`)
    .join('');

  return [
    `${selector}{${light}${scales}}`,
    `${selector}[data-theme="dark"]{${dark}}`,
    `@media (prefers-color-scheme: dark){${selector}:not([data-theme="light"]){${dark}}}`,
  ].join('\n');
}
