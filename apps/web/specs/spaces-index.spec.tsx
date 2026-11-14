import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InvitationCard } from '../src/app/(app)/InvitationsList';
import { SpaceCards } from '../src/app/(app)/spaces/SpaceCards';

vi.mock('../src/auth-actions/spaces', () => ({ acceptMyInvitation: vi.fn() }));

describe('the spaces list', () => {
  it('opens a space’s people and children page, not the calendar', () => {
    render(
      <SpaceCards
        spaces={[
          {
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            name: 'Ava’s week',
            role: 'owner',
            createdAt: '2026-11-01T00:00:00Z',
          },
          {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            name: 'Leo’s week',
            role: 'member',
            createdAt: '2026-11-01T00:00:00Z',
          },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: /Ava’s week/ }).getAttribute('href')).toBe(
      '/spaces/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
    expect(screen.getByText('Owner')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Leo’s week/ }).getAttribute('href')).toBe(
      '/spaces/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    );
    expect(screen.getByText('Member')).toBeTruthy();
  });

  it('lets you join an invitation', () => {
    render(
      <InvitationCard
        invitation={{
          id: 'inv',
          spaceName: 'Leo’s week',
          role: 'member',
          expiresAt: '2026-11-21T00:00:00Z',
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Join Leo’s week' })).toBeTruthy();
  });
});
