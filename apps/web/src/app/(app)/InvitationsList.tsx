import { acceptMyInvitation } from '../../auth-actions/spaces';
import type { InvitationForMe } from '../../data/types';
import { formatWhen } from '../../profile/device';
import { button, card } from '../../ui/styles';

/** An invitation waiting for this email, with Join. Used on Home and on Spaces. */
export function InvitationCard({
  invitation,
  timeZone,
}: {
  invitation: InvitationForMe;
  timeZone?: string | null;
}) {
  return (
    <div className={`${card} flex flex-wrap items-center justify-between gap-4 bg-tint-sage`}>
      <p className="text-base text-foreground">
        You are invited to <strong className="font-semibold">{invitation.spaceName}</strong>
        {invitation.role === 'owner' ? ' as an owner' : ''}.{' '}
        <span className="text-subtitle">
          Open until {formatWhen(invitation.expiresAt, timeZone)}.
        </span>
      </p>
      <form action={acceptMyInvitation}>
        <input name="invitation" type="hidden" value={invitation.id} />
        <button className={button.primary} type="submit">
          Join {invitation.spaceName}
        </button>
      </form>
    </div>
  );
}
