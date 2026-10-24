-- =============================================================================
-- Migration: Add Country Column to Subscribers & Update Profile RPC
-- =============================================================================

-- 1. Add country column to public.subscribers
alter table public.subscribers
  add column if not exists country text;

-- 2. Drop and recreate subscriber_overview view with country
drop view if exists public.subscriber_overview;

create view public.subscriber_overview
with (security_invoker = true)
as
select
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.country,
  s.phone_country_code,
  s.phone_number,
  s.preferred_contact_method,
  s.source,
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

revoke all on table public.subscriber_overview from public, anon, authenticated;

-- 3. Update update_subscriber_profile RPC with country support
drop function if exists public.update_subscriber_profile(uuid, text, text, text, text, text);
drop function if exists public.update_subscriber_profile(uuid, text, text, text, text, text, text);

create or replace function public.update_subscriber_profile(
  p_subscriber_id       uuid default null,
  p_email               text default null,
  p_first_name          text default null,
  p_last_name           text default null,
  p_country             text default null,
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
  v_country     text := nullif(btrim(coalesce(p_country, '')), '');
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
      delete from public.subscribers where id = v_conflict_id;
    end if;
  end if;

  -- Prevent unique constraint violation on email if another record has this email
  if v_email is not null then
    select id into v_conflict_id
      from public.subscribers
     where email = v_email and id <> v_id;

    if v_conflict_id is not null then
      delete from public.subscribers where id = v_conflict_id;
    end if;
  end if;

  update public.subscribers
     set first_name         = coalesce(v_first, first_name),
         last_name          = coalesce(v_last, last_name),
         country            = coalesce(v_country, country),
         email              = coalesce(v_email, email),
         phone_country_code = coalesce(v_code, phone_country_code),
         phone_number       = coalesce(v_phone, phone_number),
         updated_at         = now()
   where id = v_id;

  return jsonb_build_object('status', 'updated');
end;
$$;

revoke all on function public.update_subscriber_profile(uuid, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.update_subscriber_profile(uuid, text, text, text, text, text, text) to service_role;
