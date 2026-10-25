-- =============================================================================
-- Migration: Update Subscriber Campaign Source on Signup & Resubscription
-- =============================================================================

create or replace function public.subscribe_newsletter(
  p_email                     text default null,
  p_phone_country_code        text default null,
  p_phone_number              text default null,
  p_interest_slugs            text[] default '{}'::text[],
  p_specific_cuts_note        text default null,
  p_marketing_consent         boolean default false,
  p_consent_version           text default '',
  p_rate_key                  text default null,
  p_first_name                text default null,
  p_source                    text default 'Mumbai Pop-up',
  p_preferred_contact_method  text default 'whatsapp'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_rate_limit     constant integer  := 20;
  c_rate_window    constant integer  := 600;
  v_first          text := nullif(btrim(coalesce(p_first_name, '')), '');
  v_source         text := coalesce(nullif(btrim(coalesce(p_source, '')), ''), 'Mumbai Pop-up');
  v_method         text := coalesce(nullif(btrim(coalesce(p_preferred_contact_method, '')), ''), 'whatsapp');
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

  -- Match existing subscriber by email or phone
  select s.id, s.subscription_status
    into v_subscriber_id, v_status
    from public.subscribers s
   where (v_email is not null and s.email = v_email)
      or (v_phone is not null and s.phone_country_code = v_code and s.phone_number = v_phone)
   limit 1
   for update;

  if v_subscriber_id is not null then
    -- Existing found: update preferences, first_name, source and merge non-null identifiers
    update public.subscribers
       set first_name               = coalesce(v_first, subscribers.first_name),
           email                    = coalesce(subscribers.email, v_email),
           phone_country_code       = coalesce(subscribers.phone_country_code, v_code),
           phone_number             = coalesce(subscribers.phone_number, v_phone),
           preferred_contact_method = coalesce(v_method, subscribers.preferred_contact_method),
           source                   = coalesce(v_source, subscribers.source),
           subscription_status      = 'subscribed',
           marketing_consent        = true,
           consent_timestamp        = now(),
           consent_version          = v_version,
           specific_cuts_note       = coalesce(v_note, specific_cuts_note),
           unsubscribed_at          = null,
           updated_at               = now()
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

  -- New subscriber insert
  insert into public.subscribers
    (first_name, email, phone_country_code, phone_number, preferred_contact_method, source, subscription_status, marketing_consent, consent_timestamp, consent_version, specific_cuts_note)
  values
    (v_first, v_email, v_code, v_phone, v_method, v_source, 'subscribed', true, now(), v_version, v_note)
  returning id into v_subscriber_id;

  insert into public.subscriber_interests (subscriber_id, interest_tag_id)
  select v_subscriber_id, unnest(v_tag_ids);

  insert into public.subscription_events (subscriber_id, event_type, consent_version)
  values (v_subscriber_id, 'subscribed', v_version);

  return jsonb_build_object('status', 'subscribed', 'id', v_subscriber_id);
end;
$$;

revoke all on function public.subscribe_newsletter(text, text, text, text[], text, boolean, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text, text, text[], text, boolean, text, text, text, text, text) to service_role;
