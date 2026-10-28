-- The onboarding answer to "Who shares responsibility for a child with you?" (R27, USR-4, USR-13).
-- Null means the person skipped the question.
alter table public.users
  add column shares_with text check (
    shares_with in ('partner', 'ex_partner', 'grandparent', 'guardian', 'other_family', 'sole_caregiver')
  );

grant update (shares_with) on public.users to authenticated;
