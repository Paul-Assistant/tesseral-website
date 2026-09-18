-- Launch signups are written only through the website's server route.
create table if not exists public.launch_waitlist (
  email text primary key check (email = lower(email) and char_length(email) <= 254),
  source text not null default 'tesseral-website',
  created_at timestamptz not null default now()
);
alter table public.launch_waitlist enable row level security;
revoke all on public.launch_waitlist from anon, authenticated;
grant insert, select on public.launch_waitlist to service_role;
