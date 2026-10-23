-- =============================================================================
-- CHARINI — Newsletter signup schema
-- Shared by the public signup site AND the future (separate) admin project.
--
-- Apply once against the Supabase project (SQL editor or psql):
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20261021120000_newsletter_signup.sql
--
-- Security model
--   * anon / authenticated (publishable key, browsers): may read ACTIVE interest
--     tags only. No access to subscribers, interests, events or the view.
--   * service_role (secret key, server only): full access. The public site uses
--     it for exactly one operation: public.subscribe_newsletter(...).
--   * Supabase's default privileges grant anon/authenticated ALL on new tables
--     and EXECUTE on new functions in `public`. We revoke those explicitly
--     below — RLS alone is not relied upon.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Private schema (never exposed through the Data API)
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- interest_tags — structured, stable topics customers can choose
-- -----------------------------------------------------------------------------
create table if not exists public.interest_tags (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  label       text not null,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  constraint interest_tags_slug_key unique (slug),
  constraint interest_tags_slug_format check (
    char_length(slug) between 1 and 64 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint interest_tags_label_length check (char_length(btrim(label)) between 1 and 80)
);

create index if not exists interest_tags_active_sort_idx
  on public.interest_tags (is_active, sort_order);

comment on table public.interest_tags is
  'Newsletter topics. Slugs are stable identifiers; deactivate (is_active=false) rather than delete.';

insert into public.interest_tags (slug, label, sort_order) values
  ('charini',          'CHARINI',          10),
  ('charini-stories',  'CHARINI STORIES',  20),
  ('new-prints',       'New Prints',       30),
  ('new-cuts',         'New Cuts',         40),
  ('collections',      'Collections',      50),
  ('special-releases', 'Special Releases', 60),
  ('specific-cuts',    'Specific Cuts',    70)
on conflict (slug) do update
  set label = excluded.label,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- subscribers — one row per normalised email address
-- -----------------------------------------------------------------------------
create table if not exists public.subscribers (
  id                   uuid primary key default gen_random_uuid(),
  email                text not null,
  subscription_status  text not null default 'subscribed',
  marketing_consent    boolean not null default false,
  consent_timestamp    timestamptz,
  consent_version      text,
  specific_cuts_note   text,
  unsubscribed_at      timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint subscribers_email_key unique (email),
  constraint subscribers_email_normalized check (email = lower(btrim(email))),
  constraint subscribers_email_format check (
    char_length(email) between 3 and 254
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint subscribers_status_check check (
    subscription_status in ('pending', 'subscribed', 'unsubscribed')
  ),
  -- An active marketing subscription must always carry recorded consent.
  constraint subscribers_subscribed_requires_consent check (
    subscription_status <> 'subscribed'
    or (marketing_consent and consent_timestamp is not null and consent_version is not null)
  ),
  constraint subscribers_consent_version_length check (
    consent_version is null or char_length(consent_version) between 1 and 32
  ),
  constraint subscribers_specific_cuts_note_length check (
    specific_cuts_note is null or char_length(specific_cuts_note) between 1 and 500
  )
);

create index if not exists subscribers_status_idx     on public.subscribers (subscription_status);
create index if not exists subscribers_created_at_idx on public.subscribers (created_at desc);

drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at
  before update on public.subscribers
  for each row execute function private.set_updated_at();

comment on table public.subscribers is
  'Newsletter subscribers. email is stored lower-cased and trimmed. Never re-activate an unsubscribed row without fresh consent.';
comment on column public.subscribers.subscription_status is 'pending | subscribed | unsubscribed';
comment on column public.subscribers.specific_cuts_note is
  'Optional free text, only stored when the specific-cuts interest is selected.';

-- -----------------------------------------------------------------------------
-- subscriber_interests — many-to-many junction
-- -----------------------------------------------------------------------------
create table if not exists public.subscriber_interests (
  subscriber_id    uuid not null references public.subscribers (id)   on delete cascade,
  interest_tag_id  uuid not null references public.interest_tags (id) on delete restrict,
  created_at       timestamptz not null default now(),
  primary key (subscriber_id, interest_tag_id)
);

create index if not exists subscriber_interests_tag_idx
  on public.subscriber_interests (interest_tag_id);

-- -----------------------------------------------------------------------------
-- subscription_events — append-only consent / status audit trail
-- -----------------------------------------------------------------------------
create table if not exists public.subscription_events (
  id               bigint generated always as identity primary key,
  subscriber_id    uuid not null references public.subscribers (id) on delete cascade,
  event_type       text not null,
  consent_version  text,
  created_at       timestamptz not null default now(),
  constraint subscription_events_type_check check (
    event_type in ('subscribed', 'resubscribed', 'unsubscribed', 'preferences_updated')
  )
);

create index if not exists subscription_events_subscriber_idx
  on public.subscription_events (subscriber_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Rate limiting (private; keyed by an HMAC of the client IP, never the raw IP)
-- -----------------------------------------------------------------------------
create table if not exists private.signup_rate_limits (
  key_hash      text not null,
  window_start  timestamptz not null,
  hits          integer not null default 1,
  primary key (key_hash, window_start)
);

create index if not exists signup_rate_limits_window_idx
  on private.signup_rate_limits (window_start);

-- -----------------------------------------------------------------------------
-- Admin-friendly read model (service_role only)
-- -----------------------------------------------------------------------------
create or replace view public.subscriber_overview
with (security_invoker = true)
as
select
  s.id,
  s.email,
  s.subscription_status,
  s.marketing_consent,
  s.consent_timestamp,
  s.consent_version,
  s.specific_cuts_note,
  s.unsubscribed_at,
  s.created_at,
  s.updated_at,
  coalesce(array_agg(t.slug  order by t.sort_order) filter (where t.id is not null), '{}') as interest_slugs,
  coalesce(array_agg(t.label order by t.sort_order) filter (where t.id is not null), '{}') as interest_labels,
  coalesce(bool_or(t.slug = 'charini'), false)         as wants_charini,
  coalesce(bool_or(t.slug = 'charini-stories'), false) as wants_charini_stories
from public.subscribers s
left join public.subscriber_interests si on si.subscriber_id = s.id
left join public.interest_tags t         on t.id = si.interest_tag_id
group by s.id;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.interest_tags        enable row level security;
alter table public.subscribers          enable row level security;
alter table public.subscriber_interests enable row level security;
alter table public.subscription_events  enable row level security;

drop policy if exists "Active interest tags are publicly readable" on public.interest_tags;
create policy "Active interest tags are publicly readable"
  on public.interest_tags
  for select
  to anon, authenticated
  using (is_active);

-- No policies exist for anon/authenticated on subscribers, subscriber_interests
-- or subscription_events => every row is denied even if a privilege leaks.
-- The future admin project should use service_role server-side, or add
-- narrowly-scoped policies for an explicit admin role.

-- -----------------------------------------------------------------------------
-- Privileges (defence in depth — do not rely on RLS alone)
-- -----------------------------------------------------------------------------
revoke all on table public.interest_tags        from public, anon, authenticated;
revoke all on table public.subscribers          from public, anon, authenticated;
revoke all on table public.subscriber_interests from public, anon, authenticated;
revoke all on table public.subscription_events  from public, anon, authenticated;
revoke all on table public.subscriber_overview  from public, anon, authenticated;
revoke all on sequence public.subscription_events_id_seq from public, anon, authenticated;

grant select on table public.interest_tags to anon, authenticated;

grant all on table public.interest_tags        to service_role;
grant all on table public.subscribers          to service_role;
grant all on table public.subscriber_interests to service_role;
grant all on table public.subscription_events  to service_role;
grant select on table public.subscriber_overview to service_role;
grant usage, select on sequence public.subscription_events_id_seq to service_role;

-- -----------------------------------------------------------------------------
-- subscribe_newsletter — the ONLY write path used by the public site.
-- Runs in a single transaction: subscriber + interests + audit event are saved
-- together or not at all. Returns a status object instead of raising for
-- expected outcomes so the rate-limit counter is always committed.
-- -----------------------------------------------------------------------------
create or replace function public.subscribe_newsletter(
  p_email               text,
  p_interest_slugs      text[],
  p_specific_cuts_note  text,
  p_marketing_consent   boolean,
  p_consent_version     text,
  p_rate_key            text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_rate_limit     constant integer  := 20;          -- attempts per window per client
  c_rate_window    constant integer  := 600;         -- seconds
  v_email          text := lower(btrim(coalesce(p_email, '')));
  v_slugs          text[];
  v_tag_ids        uuid[];
  v_note           text;
  v_version        text := btrim(coalesce(p_consent_version, ''));
  v_subscriber_id  uuid;
  v_status         text;
  v_window         timestamptz;
  v_hits           integer;
begin
  -- 1. Rate limiting --------------------------------------------------------
  if p_rate_key is not null and char_length(p_rate_key) between 16 and 128 then
    v_window := to_timestamp(floor(extract(epoch from now()) / c_rate_window) * c_rate_window);

    insert into private.signup_rate_limits as r (key_hash, window_start, hits)
    values (p_rate_key, v_window, 1)
    on conflict (key_hash, window_start) do update set hits = r.hits + 1
    returning r.hits into v_hits;

    if random() < 0.05 then
      delete from private.signup_rate_limits where window_start < now() - interval '1 day';
    end if;

    if v_hits > c_rate_limit then
      return jsonb_build_object('status', 'rate_limited');
    end if;
  end if;

  -- 2. Validation (mirrors server-side Zod validation) ----------------------
  if char_length(v_email) not between 3 and 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('status', 'invalid', 'reason', 'invalid_email');
  end if;

  if p_marketing_consent is distinct from true then
    return jsonb_build_object('status', 'invalid', 'reason', 'consent_required');
  end if;

  if char_length(v_version) not between 1 and 32 then
    return jsonb_build_object('status', 'invalid', 'reason', 'invalid_request');
  end if;

  select coalesce(array_agg(distinct s), '{}')
    into v_slugs
    from unnest(coalesce(p_interest_slugs, '{}'::text[])) as s
   where s is not null;

  if cardinality(v_slugs) = 0 then
    return jsonb_build_object('status', 'invalid', 'reason', 'interests_required');
  end if;

  if cardinality(v_slugs) > 20 then
    return jsonb_build_object('status', 'invalid', 'reason', 'invalid_interests');
  end if;

  select coalesce(array_agg(t.id), '{}')
    into v_tag_ids
    from public.interest_tags t
   where t.slug = any (v_slugs)
     and t.is_active;

  if cardinality(v_tag_ids) <> cardinality(v_slugs) then
    return jsonb_build_object('status', 'invalid', 'reason', 'invalid_interests');
  end if;

  -- Specific Cuts text is only kept when that interest is selected.
  if 'specific-cuts' = any (v_slugs) then
    v_note := nullif(btrim(coalesce(p_specific_cuts_note, '')), '');
  end if;

  if v_note is not null and char_length(v_note) > 500 then
    return jsonb_build_object('status', 'invalid', 'reason', 'note_too_long');
  end if;

  -- 3. Insert new subscriber (race-safe) ------------------------------------
  insert into public.subscribers
    (email, subscription_status, marketing_consent, consent_timestamp, consent_version, specific_cuts_note)
  values
    (v_email, 'subscribed', true, now(), v_version, v_note)
  on conflict (email) do nothing
  returning id into v_subscriber_id;

  if v_subscriber_id is not null then
    insert into public.subscriber_interests (subscriber_id, interest_tag_id)
    select v_subscriber_id, unnest(v_tag_ids);

    insert into public.subscription_events (subscriber_id, event_type, consent_version)
    values (v_subscriber_id, 'subscribed', v_version);

    return jsonb_build_object('status', 'subscribed');
  end if;

  -- 4. Existing email -------------------------------------------------------
  select s.id, s.subscription_status
    into v_subscriber_id, v_status
    from public.subscribers s
   where s.email = v_email
   for update;

  if v_status = 'subscribed' then
    -- Unauthenticated visitors cannot alter an existing subscription.
    return jsonb_build_object('status', 'already_subscribed');
  end if;

  -- Previously unsubscribed / pending: this request carries fresh, explicit
  -- consent (validated above), so the subscription is renewed and recorded.
  update public.subscribers
     set subscription_status = 'subscribed',
         marketing_consent   = true,
         consent_timestamp   = now(),
         consent_version     = v_version,
         specific_cuts_note  = v_note,
         unsubscribed_at     = null
   where id = v_subscriber_id;

  delete from public.subscriber_interests where subscriber_id = v_subscriber_id;

  insert into public.subscriber_interests (subscriber_id, interest_tag_id)
  select v_subscriber_id, unnest(v_tag_ids);

  insert into public.subscription_events (subscriber_id, event_type, consent_version)
  values (v_subscriber_id, 'resubscribed', v_version);

  return jsonb_build_object('status', 'resubscribed');
end;
$$;

revoke all on function public.subscribe_newsletter(text, text[], text, boolean, text, text)
  from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text[], text, boolean, text, text)
  to service_role;

comment on function public.subscribe_newsletter(text, text[], text, boolean, text, text) is
  'Atomic newsletter signup. service_role only. Returns {status: subscribed|resubscribed|already_subscribed|rate_limited|invalid, reason?}.';
