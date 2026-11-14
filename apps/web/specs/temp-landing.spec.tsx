import { render, screen } from '@testing-library/react';
import { isProtected } from '../src/auth/routes';
import { VariationTwo } from '../src/temp-landing/VariationTwo';

describe('temp landing', () => {
  it('is a public page', () => {
    expect(isProtected('/temp-landing2')).toBe(false);
  });

  it('uses the waitlist and labels sample quotes as examples', () => {
    render(<VariationTwo />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'One record for the kids.' }),
    ).toBeTruthy();
    const waitlist = screen.getAllByRole('link', { name: 'Join the waitlist' });
    expect(waitlist.length).toBeGreaterThan(0);
    expect(waitlist[0]?.getAttribute('href')).toContain('mailto:hello@nookbud.com');
    expect(screen.getByText(/these are not reviews/i)).toBeTruthy();
  });
});
