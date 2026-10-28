import { render } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { colorTokens, lightValue } from '../src/app/design/_data/tokens';

// The forms call server actions; here they only need to render.
vi.mock('../src/auth-actions/sign-up', () => ({ signUp: vi.fn() }));
vi.mock('../src/auth-actions/sign-in', () => ({ signIn: vi.fn(), signInWithCode: vi.fn() }));
vi.mock('../src/auth-actions/resend', () => ({ resendConfirmation: vi.fn() }));
vi.mock('../src/auth-actions/password', () => ({
  requestPasswordReset: vi.fn(),
  setNewPassword: vi.fn(),
}));
vi.mock('../src/auth-actions/security', () => ({
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
  twoStep: vi.fn(),
}));
vi.mock('../src/auth-actions/spaces', () => ({
  acceptInvitation: vi.fn(),
  addChild: vi.fn(),
  createSpace: vi.fn(),
  deleteSpace: vi.fn(),
  invite: vi.fn(),
  leaveSpace: vi.fn(),
  renameSpace: vi.fn(),
  updateChild: vi.fn(),
}));
vi.mock('../src/auth-actions/profile', () => ({ saveProfile: vi.fn(), finishWelcome: vi.fn() }));

const { SignUpForm } = await import('../src/app/(account)/sign-up/SignUpForm');
const { SignInForm } = await import('../src/app/(account)/sign-in/SignInForm');
const { CodeForm } = await import('../src/app/(account)/sign-in/code/CodeForm');
const { ResendForm } = await import('../src/app/(account)/check-email/ResendForm');
const { ForgotForm } = await import('../src/app/(account)/forgot-password/ForgotForm');
const { NewPasswordForm } = await import('../src/app/(account)/reset-password/new/NewPasswordForm');
const { PasswordForm } = await import('../src/app/(app)/settings/security/PasswordForm');
const { TwoStep } = await import('../src/app/(app)/settings/security/TwoStep');
const { ProfileForm } = await import('../src/app/(app)/settings/ProfileForm');
const { DeleteAccount } = await import('../src/app/(app)/settings/DeleteAccount');
const { CreateSpaceForm } = await import('../src/app/(app)/home/CreateSpaceForm');
const { AcceptForm } = await import('../src/app/(account)/invite/[token]/AcceptForm');
const spaceForms = await import('../src/app/(app)/spaces/[id]/SpaceForms');

const profile = {
  currency: 'PHP',
  displayName: 'Priya',
  id: 'user-1',
  onboardedAt: null,
  sharesWith: null,
  termsAcceptedAt: '2026-10-28T00:00:00Z',
  termsVersion: '2026-10-28',
  timeZone: 'Asia/Manila',
};

const screens: [string, ReactElement][] = [
  ['sign up', <SignUpForm key="a" />],
  ['sign in', <SignInForm key="b" next="/settings" />],
  ['two-step code', <CodeForm key="c" />],
  ['resend confirmation', <ResendForm email="a@example.test" key="d" />],
  ['forgot password', <ForgotForm key="e" />],
  ['new password', <NewPasswordForm key="f" />],
  ['change password', <PasswordForm key="g" />],
  ['two-step off', <TwoStep enabled={false} key="h" />],
  ['two-step on', <TwoStep enabled key="i" />],
  ['delete account', <DeleteAccount key="k" />],
  ['create a space', <CreateSpaceForm first key="l" />],
  ['accept an invitation', <AcceptForm key="m" spaceName="Ava's week" token="t" />],
  ['add a child', <spaceForms.AddChildForm key="n" space="s" />],
  ['invite someone', <spaceForms.InviteForm key="o" space="s" />],
  ['rename a space', <spaceForms.RenameForm key="p" name="Ava's week" space="s" />],
  ['delete a space', <spaceForms.DeleteSpaceForm key="q" name="Ava's week" space="s" />],
  ['leave a space', <spaceForms.LeaveForm key="r" space="s" />],
  [
    'profile',
    <ProfileForm
      currencies={['PHP', 'USD']}
      key="j"
      profile={profile}
      timeZones={['Asia/Manila']}
    />,
  ],
];

// R18: every control has a label, no ARIA mistakes, nothing that only works with a mouse.
// Contrast needs real layout, so it is checked on the tokens below instead.
describe.each(screens)('the %s screen', (_name, screen) => {
  it('has no accessibility violations', async () => {
    const { container } = render(<main>{screen}</main>);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(
      result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([]);
  });
});

// ---- contrast of the text pairs the screens use (R18: 4.5:1) ------------------------------

const token = (name: string) => colorTokens.find((t) => t.name === name)?.value ?? '#000000';

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe.each([
  ['body text', 'foreground', 'background'],
  ['body text on cards', 'foreground', 'surface'],
  ['secondary text', 'subtitle', 'background'],
  ['secondary text on cards', 'subtitle', 'surface'],
  ['button labels', 'background', 'foreground'],
])('%s', (_name, text, background) => {
  // The app screens are light only (see ui/AppRoot.tsx).
  it('meets 4.5:1', () => {
    expect(contrast(lightValue(token(text)), lightValue(token(background)))).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
