import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config.js';

describe('next config', () => {
  it('builds a self-contained server for the container', () => {
    expect(nextConfig.output).toBe('standalone');
  });
});
