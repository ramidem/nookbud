import Link from 'next/link';
import { spacePath } from '../../../auth/routes';
import type { Space } from '../../../data/types';
import { card, focusRing } from '../../../ui/styles';

/** Space cards on `/spaces`. A card opens people and children, not the calendar. */
export function SpaceCards({ spaces }: { spaces: Space[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {spaces.map((space) => (
        <li key={space.id}>
          <Link
            className={`${card} block transition-colors hover:border-border-strong ${focusRing}`}
            href={spacePath(space.id)}
          >
            <span className="block text-[1.125rem] font-semibold text-foreground">
              {space.name}
            </span>
            <span className="mt-1 block text-sm text-subtitle">
              {space.role === 'owner' ? 'Owner' : 'Member'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
