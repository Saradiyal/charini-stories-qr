-- CHARINI Stories: Newsletter Subscribers Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the table
create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    preferences text[] not null default '{}',
    source text not null default 'direct',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ensure email is unique (case-insensitive unique index)
create unique index if not exists newsletter_subscribers_email_uidx
on public.newsletter_subscribers (lower(trim(email)));

-- 3. Automatic updated_at timestamp trigger
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscribers_updated_at
    before update on public.newsletter_subscribers
    for each row
    execute function public.set_current_timestamp_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.newsletter_subscribers enable row level security;

-- 5. Policies
-- Prevent public/anon users from viewing any subscriber emails
drop policy if exists "No public select on newsletter subscribers" on public.newsletter_subscribers;
create policy "No public select on newsletter subscribers"
    on public.newsletter_subscribers
    for select
    to authenticated, anon
    using (false);

-- Server-side API route uses the service_role key to safely query and upsert subscribers.
-- By default, service_role bypasses RLS in Supabase, but explicit policy ensures clarity:
drop policy if exists "Service role full access on newsletter subscribers" on public.newsletter_subscribers;
create policy "Service role full access on newsletter subscribers"
    on public.newsletter_subscribers
    for all
    to service_role
    using (true)
    with check (true);
