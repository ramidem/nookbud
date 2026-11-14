import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/auth';
import { getSpaces } from '@/data';
import { SPACES, spacePath } from '../../../../auth/routes';
import { heading, link } from '../../../../ui/styles';
import { SpaceTabs } from './SpaceTabs';

/** Every page in a space: its name, and the calendar, records and people tabs. */
export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(spacePath(id));
  const space = await (await getSpaces()).get(id);
  if (!space) notFound();
  return (
    <div>
      <Link className={`${link} text-sm`} href={SPACES}>
        All spaces
      </Link>
      <h1 className={`${heading} mt-3 break-words`}>{space.name}</h1>
      <SpaceTabs space={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
