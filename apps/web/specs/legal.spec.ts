import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config.js';
import { POLICY_VERSION } from '../src/legal/policies';

const legal = path.join(__dirname, '..', 'documentation', 'legal');

describe('policies', () => {
  it.each(['terms.md', 'privacy.md'])('%s states the version people accept', (file) => {
    const page = fs.readFileSync(path.join(legal, file), 'utf8');
    expect(page).toContain(`Version ${POLICY_VERSION}.`);
  });

  it('serves both at short addresses', async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ destination: '/documentation/legal/terms', source: '/terms' }),
        expect.objectContaining({
          destination: '/documentation/legal/privacy',
          source: '/privacy',
        }),
      ]),
    );
  });
});
