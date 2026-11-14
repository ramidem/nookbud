import { render, screen } from '@testing-library/react';
import { TempLanding } from '../src/temp-landing/TempLanding';
import { isProtected } from '../src/auth/routes';

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
