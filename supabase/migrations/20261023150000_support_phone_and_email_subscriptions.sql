-- =============================================================================
-- Migration: Support Phone Number & Email Signups with Smart Auto-Merging
-- Allows clients to subscribe with either Email OR WhatsApp Mobile Number.
-- Automatically merges profiles on matching email or phone without collision.
-- =============================================================================

-- 1. Make email column nullable on public.subscribers
alter table public.subscribers alter column email drop not null;

-- 2. Update email format check to allow null or valid email
alter table public.subscribers drop constraint if exists subscribers_email_format;
alter table public.subscribers add constraint subscribers_email_format check (
  email is null or (
    char_length(email) between 3 and 254
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
);

-- 3. Require at least one contact channel (email or phone)
alter table public.subscribers drop constraint if exists subscribers_contact_required;
alter table public.subscribers add constraint subscribers_contact_required check (
  email is not null or phone_number is not null
);

-- 4. Unique partial index on phone number when present
create unique index if not exists subscribers_phone_unique_idx
  on public.subscribers (phone_country_code, phone_number)
  where phone_number is not null;

-- 5. Drop old subscribe_newsletter functions if signatures differ
drop function if exists public.subscribe_newsletter(text, text[], text, boolean, text, text);

-- 6. Atomic Subscribe Function with Email or Phone Support & Auto-Merge
create or replace function public.subscribe_newsletter(
  p_email               text default null,
  p_phone_country_code  text default null,
  p_phone_number        text default null,
  p_interest_slugs      text[] default '{}'::text[],
  p_specific_cuts_note  text default null,
  p_marketing_consent   boolean default false,
  p_consent_version     text default '',
  p_rate_key            text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_rate_limit     constant integer  := 20;
  c_rate_window    constant integer  := 600;
  v_email          text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_code           text := nullif(btrim(coalesce(p_phone_country_code, '')), '');
  v_phone          text := nullif(regexp_replace(coalesce(p_phone_number, ''), '\D', '', 'g'), '');
  v_slugs          text[];
  v_tag_ids        uuid[];
  v_note           text;
  v_version        text := btrim(coalesce(p_consent_version, ''));
  v_subscriber_id  uuid;
  v_status         text;
  v_window         timestamptz;
  v_hits           integer;
begin
  -- Rate limiting
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

  -- Contact validation: at least one required
  if v_email is null and v_phone is null then
    return jsonb_build_object('status', 'invalid', 'reason', 'contact_required');
  end if;

  if v_email is not null then
    if char_length(v_email) not between 3 and 254
       or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
      return jsonb_build_object('status', 'invalid', 'reason', 'invalid_email');
    end if;
  end if;

  if v_phone is not null then
    if v_code is null then
      v_code := '+91';
    end if;
    if v_code = '+91' and v_phone ~ '^0+' then
      v_phone := regexp_replace(v_phone, '^0+', '');
    end if;
    if char_length(v_phone) not between 6 and 15 then
      return jsonb_build_object('status', 'invalid', 'reason', 'invalid_phone');
    end if;
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

  if 'specific-cuts' = any (v_slugs) then
    v_note := nullif(btrim(coalesce(p_specific_cuts_note, '')), '');
  end if;

  if v_note is not null and char_length(v_note) > 500 then
    return jsonb_build_object('status', 'invalid', 'reason', 'note_too_long');
  end if;

  -- 3. Match existing subscriber by email or phone
  select s.id, s.subscription_status
    into v_subscriber_id, v_status
    from public.subscribers s
   where (v_email is not null and s.email = v_email)
      or (v_phone is not null and s.phone_country_code = v_code and s.phone_number = v_phone)
   limit 1
   for update;

  if v_subscriber_id is not null then
    -- Existing found: update preferences and merge non-null identifiers
    update public.subscribers
       set email               = coalesce(subscribers.email, v_email),
           phone_country_code  = coalesce(subscribers.phone_country_code, v_code),
           phone_number        = coalesce(subscribers.phone_number, v_phone),
           subscription_status = 'subscribed',
           marketing_consent   = true,
           consent_timestamp   = now(),
           consent_version     = v_version,
           specific_cuts_note  = coalesce(v_note, specific_cuts_note),
           unsubscribed_at     = null,
           updated_at          = now()
     where id = v_subscriber_id;

    delete from public.subscriber_interests where subscriber_id = v_subscriber_id;

    insert into public.subscriber_interests (subscriber_id, interest_tag_id)
    select v_subscriber_id, unnest(v_tag_ids);

    insert into public.subscription_events (subscriber_id, event_type, consent_version)
    values (
      v_subscriber_id,
      case when v_status = 'subscribed' then 'preferences_updated' else 'resubscribed' end,
      v_version
    );

    return jsonb_build_object('status', 'subscribed', 'id', v_subscriber_id);
  end if;

  -- 4. New subscriber insert
  insert into public.subscribers
    (email, phone_country_code, phone_number, subscription_status, marketing_consent, consent_timestamp, consent_version, specific_cuts_note)
  values
    (v_email, v_code, v_phone, 'subscribed', true, now(), v_version, v_note)
  returning id into v_subscriber_id;

  insert into public.subscriber_interests (subscriber_id, interest_tag_id)
  select v_subscriber_id, unnest(v_tag_ids);

  insert into public.subscription_events (subscriber_id, event_type, consent_version)
  values (v_subscriber_id, 'subscribed', v_version);

  return jsonb_build_object('status', 'subscribed', 'id', v_subscriber_id);
end;
$$;

revoke all on function public.subscribe_newsletter(text, text, text, text[], text, boolean, text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text, text, text[], text, boolean, text, text) to service_role;

-- 7. Profile Update with Collision Prevention & Auto-Merge
drop function if exists public.update_subscriber_profile(text, text, text, text, text);
drop function if exists public.update_subscriber_profile(uuid, text, text, text, text, text);

create or replace function public.update_subscriber_profile(
  p_subscriber_id       uuid default null,
  p_email               text default null,
  p_first_name          text default null,
  p_last_name           text default null,
  p_phone_country_code  text default null,
  p_phone_number        text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id          uuid := p_subscriber_id;
  v_email       text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_first       text := nullif(btrim(coalesce(p_first_name, '')), '');
  v_last        text := nullif(btrim(coalesce(p_last_name, '')), '');
  v_code        text := nullif(btrim(coalesce(p_phone_country_code, '')), '');
  v_phone       text := nullif(regexp_replace(coalesce(p_phone_number, ''), '\D', '', 'g'), '');
  v_conflict_id uuid;
begin
  if v_code = '+91' and v_phone ~ '^0+' then
    v_phone := regexp_replace(v_phone, '^0+', '');
  end if;

  -- Locate subscriber if v_id was not provided
  if v_id is null then
    select s.id into v_id
      from public.subscribers s
     where (v_email is not null and s.email = v_email)
        or (v_phone is not null and s.phone_country_code = v_code and s.phone_number = v_phone)
     limit 1;
  end if;

  if v_id is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  -- Prevent unique constraint violation on phone if another record has this phone
  if v_phone is not null and v_code is not null then
    select id into v_conflict_id
      from public.subscribers
     where phone_country_code = v_code and phone_number = v_phone and id <> v_id;

    if v_conflict_id is not null then
      -- Merge conflict record into target record
      delete from public.subscribers where id = v_conflict_id;
    end if;
  end if;

  -- Prevent unique constraint violation on email if another record has this email
  if v_email is not null then
    select id into v_conflict_id
      from public.subscribers
     where email = v_email and id <> v_id;

    if v_conflict_id is not null then
      -- Merge conflict record into target record
      delete from public.subscribers where id = v_conflict_id;
    end if;
  end if;

  update public.subscribers
     set first_name         = coalesce(v_first, first_name),
         last_name          = coalesce(v_last, last_name),
         email              = coalesce(v_email, email),
         phone_country_code = coalesce(v_code, phone_country_code),
         phone_number       = coalesce(v_phone, phone_number),
         updated_at         = now()
   where id = v_id;

  return jsonb_build_object('status', 'updated');
end;
$$;

revoke all on function public.update_subscriber_profile(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.update_subscriber_profile(uuid, text, text, text, text, text) to service_role;
