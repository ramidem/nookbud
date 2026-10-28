import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config.js';

describe('next config', () => {
  it('builds a self-contained server for the container', () => {
    expect(nextConfig.output).toBe('standalone');
  });
});

describe('security headers', () => {
  it('sends them on every page', async () => {
    const rules = await nextConfig.headers();
    const all = rules.find((rule) => rule.source === '/:path*');
    const names = all.headers.map((h) => h.key);
    expect(names).toEqual(
      expect.arrayContaining([
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'Permissions-Policy',
      ]),
    );
    const csp = all.headers.find((h) => h.key === 'Content-Security-Policy').value;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toMatch(/connect-src 'self'(;| ws:)/);
  });

  it('does not announce the framework', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
