import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../src/app/(app)/Sidebar';

const nav = vi.hoisted(() => ({ path: '/home' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.path }));

describe('dashboard sidebar', () => {
  it('shows Home, Spaces and Settings on a raised card', () => {
    nav.path = '/home';
    render(<Sidebar />);

    const rail = screen.getByRole('complementary', { name: 'Dashboard' });
    expect(rail.className).toContain('rounded-xl');
    expect(rail.className).toContain('bg-surface');
    expect(rail.className).toContain('shadow-[var(--shadow-sm)]');

    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Spaces' }).getAttribute('href')).toBe('/spaces');
    expect(screen.getByRole('link', { name: 'Spaces' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'This week' })).toBeNull();
    expect(screen.queryByText('Handoff')).toBeNull();
    expect(screen.queryByText('School')).toBeNull();
    expect(screen.queryByText('Appointment')).toBeNull();
  });

  it('marks Spaces current on a space page', () => {
    nav.path = '/spaces/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: 'Spaces' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
  });
});
