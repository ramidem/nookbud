import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../src/app/(app)/Sidebar';

vi.mock('next/navigation', () => ({ usePathname: () => '/home' }));

describe('dashboard sidebar', () => {
  it('shows the static week on a raised card', () => {
    render(<Sidebar />);

    const rail = screen.getByRole('complementary', { name: 'Dashboard' });
    expect(rail.className).toContain('rounded-xl');
    expect(rail.className).toContain('bg-surface');
    expect(rail.className).toContain('shadow-[var(--shadow-sm)]');

    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('heading', { name: 'This week' })).toBeTruthy();
    expect(screen.getByText('Handoff')).toBeTruthy();
    expect(screen.getByText('School')).toBeTruthy();
    expect(screen.getByText('Appointment')).toBeTruthy();
  });
});
