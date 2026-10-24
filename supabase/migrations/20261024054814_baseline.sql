-- Baseline. Helpers every table uses.

-- Keeps `updated_at` honest. Attach it to every table that has the column:
--   create trigger set_updated_at before update on public.<table>
--   for each row execute function public.set_updated_at();
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
