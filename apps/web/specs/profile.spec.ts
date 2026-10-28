import { describe, expect, it } from 'vitest';
import { describeDevice, formatWhen } from '../src/profile/device';
import { CURRENCIES, isTimeZone } from '../src/profile/options';

describe('the devices list (R20)', () => {
  it.each([
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
      'Chrome on Mac',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Safari on iPhone',
    ],
    [
      'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36',
      'Chrome on Android',
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
      'Firefox on Windows',
    ],
    [null, 'Unknown device'],
  ])('names %s', (ua, name) => {
    expect(describeDevice(ua)).toBe(name);
  });

  it('shows times in the person’s own time zone (R24)', () => {
    expect(formatWhen('2026-10-28T00:30:00Z', 'Asia/Manila')).toContain('8:30');
    expect(formatWhen('2026-10-28T00:30:00Z', 'Europe/London')).toContain('12:30');
  });
});

describe('profile choices (R24)', () => {
  it('knows real time zones and nothing else', () => {
    expect(isTimeZone('Asia/Manila')).toBe(true);
    expect(isTimeZone('Mars/Olympus')).toBe(false);
  });

  it('offers ISO currency codes, starting with the peso', () => {
    expect(CURRENCIES[0]).toBe('PHP');
    for (const code of CURRENCIES) expect(code).toMatch(/^[A-Z]{3}$/);
  });
});
