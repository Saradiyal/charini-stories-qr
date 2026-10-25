-- Migration: 20261025120000_secure_subscriber_profile_conflict.sql
-- Security remediation: Eliminate destructive DELETE on conflicting subscribers.
-- Return a controlled conflict response instead of deleting existing customer records.
-- Enforce subscriber ID requirement to prevent unauthorized profile takeover.

create or replace function public.update_subscriber_profile(
  p_subscriber_id      uuid default null,
  p_email              text default null,
  p_first_name         text default null,
  p_last_name          text default null,
  p_country            text default null,
  p_phone_country_code text default null,
  p_phone_number       text default null
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
  v_exists      boolean;
begin
  if v_code = '+91' and v_phone ~ '^0+' then
    v_phone := regexp_replace(v_phone, '^0+', '');
  end if;

  -- 1. Explicit subscriber identity verification:
  -- The caller MUST supply a valid subscriber ID verified by the application layer.
  -- Reject requests that attempt unauthenticated email/phone lookups.
  if v_id is null then
    return jsonb_build_object('status', 'invalid', 'reason', 'subscriber_id_required');
  end if;

  -- 2. Verify target subscriber exists
  select exists(select 1 from public.subscribers where id = v_id) into v_exists;
  if not v_exists then
    return jsonb_build_object('status', 'not_found');
  end if;

  -- 3. Non-destructive conflict check for phone:
  -- If another record already has this phone number, return conflict without modifying or deleting either record.
  if v_phone is not null and v_code is not null then
    select id into v_conflict_id
      from public.subscribers
     where phone_country_code = v_code and phone_number = v_phone and id <> v_id
     limit 1;

    if v_conflict_id is not null then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'phone_already_in_use'
      );
    end if;
  end if;

  -- 4. Non-destructive conflict check for email:
  -- If another record already has this email address, return conflict without modifying or deleting either record.
  if v_email is not null then
    select id into v_conflict_id
      from public.subscribers
     where email = v_email and id <> v_id
     limit 1;

    if v_conflict_id is not null then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'email_already_in_use'
      );
    end if;
  end if;

  -- 5. Safe atomic update
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

-- Backward-compatible wrapper for 6-argument callers: safely forwards to 7-argument version
create or replace function public.update_subscriber_profile(
  p_subscriber_id      uuid default null,
  p_email              text default null,
  p_first_name         text default null,
  p_last_name          text default null,
  p_phone_country_code text default null,
  p_phone_number       text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.update_subscriber_profile(
    p_subscriber_id,
    p_email,
    p_first_name,
    p_last_name,
    null,
    p_phone_country_code,
    p_phone_number
  );
end;
$$;

revoke all on function public.update_subscriber_profile(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.update_subscriber_profile(uuid, text, text, text, text, text) to service_role;
