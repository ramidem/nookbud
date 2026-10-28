import type { Metadata } from 'next';
import { getProfiles } from '@/data';
import { finishWelcome } from '../../../auth-actions/profile';
import { SHARES_WITH } from '../../../data/types';
import { SHARES_WITH_LABELS } from '../../../profile/options';
import { Field } from '../../../ui/Field';
import { SubmitButton } from '../../../ui/SubmitButton';
import { body, button, card } from '../../../ui/styles';

export const metadata: Metadata = { title: 'Welcome · Nookbud' };

export default async function WelcomePage() {
  const profile = await (await getProfiles()).get();
  return (
    <div className="mx-auto max-w-[36rem]">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[1px] text-subtitle">
        Welcome to Nookbud
      </p>
      <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.15] tracking-[-0.5px] text-foreground">
        Two homes. One childhood.
      </h1>
      <p className={`${body} mt-3`}>
        Two quick questions so Nookbud fits your family. You can skip both, and change them later in
        Settings.
      </p>

      <form action={finishWelcome} className={`${card} mt-8 grid gap-6`}>
        <Field
          autoComplete="name"
          defaultValue={profile?.displayName ?? ''}
          hint="How you appear to the people you invite."
          label="Your name"
          name="displayName"
        />
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">
            Who shares responsibility for a child with you?
          </legend>
          {SHARES_WITH.map((value) => (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2 text-sm text-foreground has-[:checked]:border-primary has-[:checked]:bg-tint-sage"
              key={value}
            >
              <input
                className="size-4 accent-[var(--primary)]"
                defaultChecked={profile?.sharesWith === value}
                name="sharesWith"
                type="radio"
                value={value}
              />
              {SHARES_WITH_LABELS[value]}
            </label>
          ))}
          <p className="mt-1 text-sm text-subtitle">
            Using Nookbud on your own is fine. You can invite people later.
          </p>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton pendingLabel="Saving…">Continue</SubmitButton>
          <button className={button.ghost} name="skip" type="submit" value="yes">
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
