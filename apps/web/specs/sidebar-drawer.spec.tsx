import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AppScroll,
  SidebarDrawerProvider,
  SidebarMenuButton,
} from '../src/app/(app)/SidebarDrawer';

vi.mock('next/navigation', () => ({ usePathname: () => '/home' }));

function renderShell() {
  return render(
    <SidebarDrawerProvider>
      <AppScroll>
        <SidebarMenuButton />
      </AppScroll>
    </SidebarDrawerProvider>,
  );
}

describe('phone sidebar', () => {
  it('opens the sidebar from the menu button and closes it again', () => {
    renderShell();

    expect(screen.queryByRole('dialog')).toBeNull();
    const menu = screen.getByRole('button', { name: 'Show sidebar' });
    expect(menu.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(menu);
    const dialog = screen.getByRole('dialog', { name: 'Sidebar' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.className).toContain('inset-y-0');
    expect(dialog.className).toContain('h-full');
    expect(within(dialog).getByRole('complementary', { name: 'Dashboard' }).className).toContain(
      'h-full',
    );
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(within(dialog).getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home');
    expect(within(dialog).getByRole('link', { name: 'Spaces' }).getAttribute('href')).toBe(
      '/spaces',
    );
    expect(within(dialog).getByRole('link', { name: 'Settings' }).getAttribute('href')).toBe(
      '/settings',
    );
    expect(within(dialog).queryByRole('heading', { name: 'This week' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(menu.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes from the scrim and from Escape', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: 'Show sidebar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Show sidebar' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
