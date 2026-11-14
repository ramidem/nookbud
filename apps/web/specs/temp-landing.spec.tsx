import { render, screen } from '@testing-library/react';
import { isProtected } from '../src/auth/routes';
import { TempLanding } from '../src/temp-landing/TempLanding';
import { VariationOne } from '../src/temp-landing/VariationOne';
import { VariationTwo } from '../src/temp-landing/VariationTwo';

describe('temp landing', () => {
  it('is a public page', () => {
    expect(isProtected('/temp-landing')).toBe(false);
  });

  it('uses the waitlist and labels sample quotes as examples', () => {
    render(<TempLanding />);
    expect(screen.getByRole('heading', { level: 1, name: /one record/i })).toBeTruthy();
    const waitlist = screen.getAllByRole('link', { name: 'Join the waitlist' });
    expect(waitlist.length).toBeGreaterThan(0);
    expect(waitlist[0]?.getAttribute('href')).toContain('mailto:hello@nookbud.com');
    expect(screen.getByText(/these are not reviews/i)).toBeTruthy();
  });
});

describe.each([
  ['/temp-landing1', VariationOne],
  ['/temp-landing2', VariationTwo],
] as const)('%s', (path, Page) => {
  it('is public and keeps the waitlist', () => {
    expect(isProtected(path)).toBe(false);
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: /one record/i })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /waitlist/i })[0]?.getAttribute('href')).toContain(
      'mailto:hello@nookbud.com',
    );
  });
});
