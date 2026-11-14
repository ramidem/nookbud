import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileNav, accountInitials } from '../src/app/(app)/MobileNav';

const spaces = [
  { id: 'ava', name: 'Ava and Noah' },
  { id: 'weekends', name: 'Weekends' },
];

vi.mock('next/navigation', () => ({ usePathname: () => '/spaces/ava/calendar' }));

function renderNav() {
  return render(
    <MobileNav
      email="alex@example.com"
      name="Alexandra Nguyen"
      signOut={vi.fn(async () => undefined)}
      spaces={spaces}
    />,
  );
}

describe('phone top bar', () => {
  it('builds initials from the name, then the email', () => {
    expect(accountInitials('Alexandra Nguyen', 'alex@example.com')).toBe('AN');
    expect(accountInitials(null, 'alex@example.com')).toBe('AL');
    expect(accountInitials(null, null)).toBe('?');
  });

  it('lists space names, and keeps settings and sign out on the avatar', () => {
    renderNav();

    expect(screen.queryByRole('link', { name: 'Settings' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();

    const spacesButton = screen.getByRole('button', { name: 'Ava and Noah, spaces' });
    expect(spacesButton.textContent).toContain('Ava and Noah');
    expect(spacesButton.className).toContain('border-border-strong');
    expect(spacesButton.className).toContain('bg-surface');
    expect(spacesButton.className).toContain('w-full');
    expect(spacesButton.className).toContain('justify-between');
    fireEvent.click(spacesButton);
    const current = screen.getByRole('link', { name: 'Ava and Noah' });
    expect(current.getAttribute('href')).toBe('/spaces/ava/calendar');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.className).toContain('font-semibold');
    expect(current.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Weekends' }).querySelector('[aria-hidden="true"]'),
    ).toBeNull();
    expect(screen.getByRole('link', { name: 'Weekends' }).getAttribute('href')).toBe(
      '/spaces/weekends/calendar',
    );
    expect(screen.getByRole('link', { name: 'All spaces' }).getAttribute('href')).toBe('/home');

    fireEvent.click(screen.getByRole('button', { name: 'Alexandra Nguyen, account' }));
    expect(screen.queryByRole('link', { name: 'Weekends' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('href')).toBe('/settings');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();
    expect(screen.getByText('AN')).toBeTruthy();
  });

  it('offers to create a space when there are none', () => {
    render(
      <MobileNav email={null} name={null} signOut={vi.fn(async () => undefined)} spaces={[]} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Spaces' }));
    expect(screen.getByText('No spaces yet.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Create a space' }).getAttribute('href')).toBe('/home');
  });
});
