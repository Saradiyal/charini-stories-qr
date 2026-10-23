-- =============================================================================
-- Migration: Add Profile Fields to Subscribers (First name, Last name, Phone)
-- =============================================================================

alter table public.subscribers
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone_country_code text,
  add column if not exists phone_number text;

-- Drop and recreate subscriber_overview view cleanly
drop view if exists public.subscriber_overview;

create view public.subscriber_overview
with (security_invoker = true)
as
select
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.phone_country_code,
  s.phone_number,
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

-- Function to safely update subscriber profile
create or replace function public.update_subscriber_profile(
  p_email               text,
  p_first_name          text,
  p_last_name           text,
  p_phone_country_code  text,
  p_phone_number        text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_first text := nullif(btrim(coalesce(p_first_name, '')), '');
  v_last  text := nullif(btrim(coalesce(p_last_name, '')), '');
  v_code  text := nullif(btrim(coalesce(p_phone_country_code, '')), '');
  v_phone text := nullif(regexp_replace(coalesce(p_phone_number, ''), '\D', '', 'g'), '');
begin
  if char_length(v_email) not between 3 and 254 then
    return jsonb_build_object('status', 'invalid', 'reason', 'invalid_email');
  end if;

  update public.subscribers
     set first_name = coalesce(v_first, first_name),
         last_name = coalesce(v_last, last_name),
         phone_country_code = coalesce(v_code, phone_country_code),
         phone_number = coalesce(v_phone, phone_number),
         updated_at = now()
   where email = v_email;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  return jsonb_build_object('status', 'updated');
end;
$$;

revoke all on function public.update_subscriber_profile(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.update_subscriber_profile(text, text, text, text, text) to service_role;
