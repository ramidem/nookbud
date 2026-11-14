'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/auth';
import { getSpaces } from '@/data';
import { HOME, INVITE, SPACES, spacePath } from '../auth/routes';
import { siteOrigin } from './origin';
import { type FieldErrors, email, fieldErrors } from './validation';

const id = z.uuid();
const spaceName = z
  .string()
  .trim()
  .min(1, { error: 'Give the space a name.' })
  .max(80, { error: 'Use 80 characters or fewer.' });
const childName = z
  .string()
  .trim()
  .min(1, { error: 'Enter a name or nickname.' })
  .max(60, { error: 'Use 60 characters or fewer.' });
const birthDate = z.preprocess(
  (v) => (v === '' ? null : v),
  z.iso.date({ error: 'Enter a date, like 2019-05-02.' }).nullable(),
);
const role = z.enum(['owner', 'member']);

export type FormState<K extends string = string> = {
  message?: string;
  errors?: FieldErrors<K>;
  done?: boolean;
};

const read = (form: FormData) => Object.fromEntries(form);

/** SPC-1 */
export async function createSpace(
  _p: FormState<'name'>,
  form: FormData,
): Promise<FormState<'name'>> {
  await requireUser(SPACES);
  const parsed = z.object({ name: spaceName }).safeParse(read(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const result = await (await getSpaces()).create(parsed.data.name);
  if (!result.ok) return { message: result.message };
  redirect(spacePath(result.data));
}

/** SPC-4 */
export async function renameSpace(
  _p: FormState<'name'>,
  form: FormData,
): Promise<FormState<'name'>> {
  const parsed = z.object({ space: id, name: spaceName }).safeParse(read(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await requireUser(spacePath(parsed.data.space));
  const result = await (await getSpaces()).rename(parsed.data.space, parsed.data.name);
  if (!result.ok) return { message: result.message };
  revalidatePath(spacePath(parsed.data.space));
  return { done: true };
}

/** SPC-5: the owner types the space's name to confirm. */
export async function deleteSpace(
  _p: FormState<'confirm'>,
  form: FormData,
): Promise<FormState<'confirm'>> {
  const parsed = z.object({ space: id, confirm: z.string() }).safeParse(read(form));
  if (!parsed.success) return { message: 'That did not work. Try again.' };
  await requireUser(spacePath(parsed.data.space));
  const spaces = await getSpaces();
  const space = await spaces.get(parsed.data.space);
  if (!space || parsed.data.confirm.trim() !== space.name) {
    return { errors: { confirm: 'Type the space’s name exactly as it is shown.' } };
  }
  const result = await spaces.remove(space.id);
  if (!result.ok) return { message: result.message };
  redirect(`${SPACES}?note=space-deleted`);
}

/** Children (SPC-3, PRIV-2) */
export async function addChild(
  _p: FormState<'name' | 'birthDate'>,
  form: FormData,
): Promise<FormState<'name' | 'birthDate'>> {
  const parsed = z.object({ space: id, name: childName, birthDate }).safeParse(read(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await requireUser(spacePath(parsed.data.space));
  const result = await (await getSpaces()).addChild(parsed.data.space, parsed.data);
  if (!result.ok) return { message: result.message };
  revalidatePath(spacePath(parsed.data.space));
  return { done: true };
}

export async function updateChild(
  _p: FormState<'name' | 'birthDate'>,
  form: FormData,
): Promise<FormState<'name' | 'birthDate'>> {
  const parsed = z
    .object({ space: id, child: id, name: childName, birthDate })
    .safeParse(read(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await requireUser(spacePath(parsed.data.space));
  const result = await (await getSpaces()).updateChild(parsed.data.child, parsed.data);
  if (!result.ok) return { message: result.message };
  revalidatePath(spacePath(parsed.data.space));
  return { done: true };
}

export async function removeChild(form: FormData) {
  const parsed = z.object({ space: id, child: id }).safeParse(read(form));
  if (!parsed.success) return;
  await requireUser(spacePath(parsed.data.space));
  await (await getSpaces()).removeChild(parsed.data.child);
  revalidatePath(spacePath(parsed.data.space));
}

export type InviteState = FormState<'email'> & { link?: string; invited?: string };

/** MEM-1, INV-1: the link is shown once, to copy and send. Emailing it comes with R6. */
export async function invite(_p: InviteState, form: FormData): Promise<InviteState> {
  const parsed = z.object({ space: id, email, role }).safeParse(read(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await requireUser(spacePath(parsed.data.space));
  const result = await (
    await getSpaces()
  ).invite(parsed.data.space, parsed.data.email, parsed.data.role);
  if (!result.ok) return { message: result.message };
  revalidatePath(spacePath(parsed.data.space));
  return { link: `${await siteOrigin()}${INVITE}/${result.data}`, invited: parsed.data.email };
}

export async function revokeInvitation(form: FormData) {
  const parsed = z.object({ space: id, invitation: id }).safeParse(read(form));
  if (!parsed.success) return;
  await requireUser(spacePath(parsed.data.space));
  await (await getSpaces()).revokeInvitation(parsed.data.invitation);
  revalidatePath(spacePath(parsed.data.space));
}

export type AcceptState = { message?: string };

/** INV-2, INV-4: from the link. */
export async function acceptInvitation(_p: AcceptState, form: FormData): Promise<AcceptState> {
  const token = String(form.get('token') ?? '');
  if (!/^[0-9a-f]{64}$/.test(token)) return { message: 'This invitation is no longer valid.' };
  await requireUser(`${INVITE}/${token}`);
  const result = await (await getSpaces()).accept(token);
  if (!result.ok) return { message: result.message };
  redirect(spacePath(result.data));
}

/** From Home or Spaces, for someone who signed up after being invited. */
export async function acceptMyInvitation(form: FormData) {
  const parsed = z.object({ invitation: id }).safeParse(read(form));
  if (!parsed.success) return;
  await requireUser(HOME);
  const result = await (await getSpaces()).acceptForMe(parsed.data.invitation);
  if (result.ok) redirect(spacePath(result.data));
  redirect(`${SPACES}?note=invitation-failed`);
}

/** MEM-2, OQ4 */
export async function changeMember(_p: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ space: id, member: id, action: z.enum(['remove', 'make-owner', 'make-member']) })
    .safeParse(read(form));
  if (!parsed.success) return { message: 'That did not work. Try again.' };
  await requireUser(spacePath(parsed.data.space));
  const spaces = await getSpaces();
  const { space, member, action } = parsed.data;
  const result =
    action === 'remove'
      ? await spaces.removeMember(space, member)
      : await spaces.setRole(space, member, action === 'make-owner' ? 'owner' : 'member');
  if (!result.ok) return { message: result.message };
  revalidatePath(spacePath(space));
  return { done: true };
}

/** MEM-3, SPC-6 */
export async function leaveSpace(_p: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ space: id }).safeParse(read(form));
  if (!parsed.success) return { message: 'That did not work. Try again.' };
  await requireUser(spacePath(parsed.data.space));
  const result = await (await getSpaces()).leave(parsed.data.space);
  if (!result.ok) return { message: result.message };
  redirect(`${SPACES}?note=left`);
}
