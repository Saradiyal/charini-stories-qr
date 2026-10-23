-- =============================================================================
-- Migration: Allow Silent Preference Updates for Returning Subscribers
-- If an already-subscribed client submits again, update their interests and notes
-- cleanly without rejecting them with an error.
-- =============================================================================

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

  -- 2. Validation -----------------------------------------------------------
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

  -- 4. Existing email (Auto-update preferences seamlessly) ------------------
  select s.id, s.subscription_status
    into v_subscriber_id, v_status
    from public.subscribers s
   where s.email = v_email
   for update;

  update public.subscribers
     set subscription_status = 'subscribed',
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

  return jsonb_build_object('status', 'subscribed');
end;
$$;

revoke all on function public.subscribe_newsletter(text, text[], text, boolean, text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text[], text, boolean, text, text) to service_role;
