-- Migration: Create campaigns table and seed Mumbai Pop-up default
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  qr_url text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed Mumbai Pop-up as default
insert into public.campaigns (name, slug, description, qr_url, is_default)
values (
  'Mumbai Pop-up',
  'mumbai-pop-up',
  'Default QR code printed for Mumbai Pop-up event',
  'https://charini-qr.vercel.app/',
  true
)
on conflict (slug) do update
set is_default = true, qr_url = 'https://charini-qr.vercel.app/';

-- Enable Row Level Security and service_role access
alter table public.campaigns enable row level security;
grant select, insert, update, delete on public.campaigns to service_role;
