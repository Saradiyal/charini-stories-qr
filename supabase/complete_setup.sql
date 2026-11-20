-- =============================================================================
-- CHARINI — Complete Database Setup & Schema
-- Run this in the Supabase SQL Editor on project ihotzaaxdkwurpkosaoq
-- =============================================================================

-- Drop view first with CASCADE to prevent "cannot drop columns from view" errors
DROP VIEW IF EXISTS public.subscriber_overview CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Private schema (never exposed through Data API)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  new.updated_at := now();
  RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION private.set_updated_at() FROM public, anon, authenticated;

-- Rate limiting table
CREATE TABLE IF NOT EXISTS private.signup_rate_limits (
  key_hash      text NOT NULL,
  window_start  timestamptz NOT NULL,
  hits          integer NOT NULL DEFAULT 1,
  PRIMARY KEY (key_hash, window_start)
);

CREATE INDEX IF NOT EXISTS signup_rate_limits_window_idx
  ON private.signup_rate_limits (window_start);

-- -----------------------------------------------------------------------------
-- 2. interest_tags
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interest_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL,
  label       text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interest_tags_slug_key UNIQUE (slug),
  CONSTRAINT interest_tags_slug_format CHECK (
    char_length(slug) BETWEEN 1 AND 64 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  CONSTRAINT interest_tags_label_length CHECK (char_length(btrim(label)) BETWEEN 1 AND 80)
);

CREATE INDEX IF NOT EXISTS interest_tags_active_sort_idx
  ON public.interest_tags (is_active, sort_order);

INSERT INTO public.interest_tags (slug, label, sort_order) VALUES
  ('charini',          'CHARINI',          10),
  ('charini-stories',  'CHARINI STORIES',  20),
  ('new-prints',       'New Prints',       30),
  ('new-cuts',         'New Cuts',         40),
  ('collections',      'Collections',      50),
  ('special-releases', 'Special Releases', 60),
  ('specific-cuts',    'Specific Cuts',    70)
ON CONFLICT (slug) DO UPDATE
  SET label = EXCLUDED.label,
      sort_order = EXCLUDED.sort_order;

-- -----------------------------------------------------------------------------
-- 3. subscribers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscribers (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name                text,
  last_name                 text,
  email                     text,
  phone_country_code        text,
  phone_number              text,
  country                   text,
  source                    text DEFAULT 'Mumbai Pop-up',
  preferred_contact_method  text DEFAULT 'whatsapp',
  subscription_status       text NOT NULL DEFAULT 'subscribed',
  marketing_consent         boolean NOT NULL DEFAULT false,
  consent_timestamp         timestamptz,
  consent_version           text,
  specific_cuts_note        text,
  unsubscribed_at           timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT subscribers_status_check CHECK (
    subscription_status IN ('pending', 'subscribed', 'unsubscribed')
  ),
  CONSTRAINT subscribers_subscribed_requires_consent CHECK (
    subscription_status <> 'subscribed'
    OR (marketing_consent AND consent_timestamp IS NOT NULL AND consent_version IS NOT NULL)
  ),
  CONSTRAINT subscribers_consent_version_length CHECK (
    consent_version IS NULL OR char_length(consent_version) BETWEEN 1 AND 32
  ),
  CONSTRAINT subscribers_specific_cuts_note_length CHECK (
    specific_cuts_note IS NULL OR char_length(specific_cuts_note) BETWEEN 1 AND 500
  ),
  CONSTRAINT subscribers_email_normalized CHECK (
    email IS NULL OR email = lower(btrim(email))
  ),
  CONSTRAINT subscribers_email_format CHECK (
    email IS NULL OR (
      char_length(email) BETWEEN 3 AND 254
      AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  ),
  CONSTRAINT subscribers_contact_method_check CHECK (
    preferred_contact_method IS NULL OR preferred_contact_method IN ('whatsapp', 'email', 'phone')
  )
);

-- Partial unique indexes allowing nullable email / phone
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_unique_idx
  ON public.subscribers (email)
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_phone_unique_idx
  ON public.subscribers (phone_country_code, phone_number)
  WHERE phone_number IS NOT NULL AND phone_country_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscribers_status_idx     ON public.subscribers (subscription_status);
CREATE INDEX IF NOT EXISTS subscribers_created_at_idx ON public.subscribers (created_at DESC);

DROP TRIGGER IF EXISTS subscribers_set_updated_at ON public.subscribers;
CREATE TRIGGER subscribers_set_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. subscriber_interests & subscription_events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriber_interests (
  subscriber_id    uuid NOT NULL REFERENCES public.subscribers (id)   ON DELETE CASCADE,
  interest_tag_id  uuid NOT NULL REFERENCES public.interest_tags (id) ON DELETE RESTRICT,
  created_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subscriber_id, interest_tag_id)
);

CREATE INDEX IF NOT EXISTS subscriber_interests_tag_idx
  ON public.subscriber_interests (interest_tag_id);

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscriber_id    uuid NOT NULL REFERENCES public.subscribers (id) ON DELETE CASCADE,
  event_type       text NOT NULL,
  consent_version  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscription_events_type_check CHECK (
    event_type IN ('subscribed', 'resubscribed', 'unsubscribed', 'preferences_updated')
  )
);

CREATE INDEX IF NOT EXISTS subscription_events_subscriber_idx
  ON public.subscription_events (subscriber_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. retail_inquiries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.retail_inquiries (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name         text NOT NULL,
  contact_name          text NOT NULL,
  email                 text,
  phone_country_code    text,
  phone_number          text,
  city                  text,
  country               text,
  inquiry_type          text NOT NULL DEFAULT 'stockist_wholesale',
  message               text,
  source                text DEFAULT 'Mumbai Pop-up',
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT retail_inquiries_contact_required CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- -----------------------------------------------------------------------------
-- 6. campaigns
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  qr_url text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.campaigns (name, slug, description, qr_url, is_default)
VALUES (
  'Mumbai Pop-up',
  'mumbai-pop-up',
  'Default QR code printed for Mumbai Pop-up event',
  'https://charini-stories-qr.vercel.app/',
  true
)
ON CONFLICT (slug) DO UPDATE
SET is_default = true, qr_url = 'https://charini-stories-qr.vercel.app/';

-- -----------------------------------------------------------------------------
-- 7. subscriber_overview View
-- -----------------------------------------------------------------------------
CREATE VIEW public.subscriber_overview
WITH (security_invoker = true)
AS
SELECT
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
  coalesce(array_agg(t.slug  ORDER BY t.sort_order) FILTER (WHERE t.id IS NOT NULL), '{}') AS interest_slugs,
  coalesce(array_agg(t.label ORDER BY t.sort_order) FILTER (WHERE t.id IS NOT NULL), '{}') AS interest_labels,
  coalesce(bool_or(t.slug = 'charini'), false)         AS wants_charini,
  coalesce(bool_or(t.slug = 'charini-stories'), false) AS wants_charini_stories
FROM public.subscribers s
LEFT JOIN public.subscriber_interests si ON si.subscriber_id = s.id
LEFT JOIN public.interest_tags t         ON t.id = si.interest_tag_id
GROUP BY s.id;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security & Permissions
-- -----------------------------------------------------------------------------
ALTER TABLE public.interest_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retail_inquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns            ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active interest tags are publicly readable" ON public.interest_tags;
CREATE POLICY "Active interest tags are publicly readable"
  ON public.interest_tags
  FOR SELECT
  TO anon, authenticated
  USING (is_active);

-- Revoke all from anon/authenticated
REVOKE ALL ON TABLE public.interest_tags        FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.subscribers          FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.subscriber_interests FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.subscription_events  FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.subscriber_overview  FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.retail_inquiries     FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.campaigns            FROM public, anon, authenticated;
REVOKE ALL ON SEQUENCE public.subscription_events_id_seq FROM public, anon, authenticated;

-- Public can read active interest tags
GRANT SELECT ON TABLE public.interest_tags TO anon, authenticated;

-- Service role has full permissions
GRANT ALL ON TABLE public.interest_tags        TO service_role;
GRANT ALL ON TABLE public.subscribers          TO service_role;
GRANT ALL ON TABLE public.subscriber_interests TO service_role;
GRANT ALL ON TABLE public.subscription_events  TO service_role;
GRANT ALL ON TABLE public.retail_inquiries     TO service_role;
GRANT ALL ON TABLE public.campaigns            TO service_role;
GRANT SELECT ON TABLE public.subscriber_overview TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.subscription_events_id_seq TO service_role;

-- -----------------------------------------------------------------------------
-- 9. RPC Functions: subscribe_newsletter
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.subscribe_newsletter(
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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
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
BEGIN
  -- Rate limiting
  IF p_rate_key IS NOT NULL AND char_length(p_rate_key) BETWEEN 16 AND 128 THEN
    v_window := to_timestamp(floor(extract(epoch FROM now()) / c_rate_window) * c_rate_window);

    INSERT INTO private.signup_rate_limits AS r (key_hash, window_start, hits)
    VALUES (p_rate_key, v_window, 1)
    ON CONFLICT (key_hash, window_start) DO UPDATE SET hits = r.hits + 1
    RETURNING r.hits INTO v_hits;

    IF random() < 0.05 THEN
      DELETE FROM private.signup_rate_limits WHERE window_start < now() - interval '1 day';
    END IF;

    IF v_hits > c_rate_limit THEN
      RETURN jsonb_build_object('status', 'rate_limited');
    END IF;
  END IF;

  -- Contact validation: at least one required
  IF v_email IS NULL AND v_phone IS NULL THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'contact_required');
  END IF;

  IF v_email IS NOT NULL THEN
    IF char_length(v_email) NOT BETWEEN 3 AND 254
       OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
      RETURN jsonb_build_object('status', 'invalid', 'reason', 'invalid_email');
    END IF;
  END IF;

  IF v_phone IS NOT NULL THEN
    IF v_code IS NULL THEN
      v_code := '+91';
    END IF;
    IF v_code = '+91' AND v_phone ~ '^0+' THEN
      v_phone := regexp_replace(v_phone, '^0+', '');
    END IF;
    IF char_length(v_phone) NOT BETWEEN 6 AND 15 THEN
      RETURN jsonb_build_object('status', 'invalid', 'reason', 'invalid_phone');
    END IF;
  END IF;

  IF p_marketing_consent IS DISTINCT FROM true THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'consent_required');
  END IF;

  IF char_length(v_version) NOT BETWEEN 1 AND 32 THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'invalid_request');
  END IF;

  SELECT coalesce(array_agg(distinct s), '{}')
    INTO v_slugs
    FROM unnest(coalesce(p_interest_slugs, '{}'::text[])) AS s
   WHERE s IS NOT NULL;

  IF cardinality(v_slugs) = 0 THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'interests_required');
  END IF;

  IF cardinality(v_slugs) > 20 THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'invalid_interests');
  END IF;

  SELECT coalesce(array_agg(t.id), '{}')
    INTO v_tag_ids
    FROM public.interest_tags t
   WHERE t.slug = ANY (v_slugs)
     AND t.is_active;

  IF cardinality(v_tag_ids) <> cardinality(v_slugs) THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'invalid_interests');
  END IF;

  IF 'specific-cuts' = ANY (v_slugs) THEN
    v_note := nullif(btrim(coalesce(p_specific_cuts_note, '')), '');
  END IF;

  IF v_note IS NOT NULL AND char_length(v_note) > 500 THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'note_too_long');
  END IF;

  -- Match existing subscriber by email or phone
  SELECT s.id, s.subscription_status
    INTO v_subscriber_id, v_status
    FROM public.subscribers s
   WHERE (v_email IS NOT NULL AND s.email = v_email)
      OR (v_phone IS NOT NULL AND s.phone_country_code = v_code AND s.phone_number = v_phone)
   LIMIT 1
   FOR UPDATE;

  IF v_subscriber_id IS NOT NULL THEN
    -- Existing found: update preferences, first_name and merge non-null identifiers
    UPDATE public.subscribers
       SET first_name               = coalesce(v_first, subscribers.first_name),
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
     WHERE id = v_subscriber_id;

    DELETE FROM public.subscriber_interests WHERE subscriber_id = v_subscriber_id;

    INSERT INTO public.subscriber_interests (subscriber_id, interest_tag_id)
    SELECT v_subscriber_id, unnest(v_tag_ids);

    INSERT INTO public.subscription_events (subscriber_id, event_type, consent_version)
    VALUES (
      v_subscriber_id,
      CASE WHEN v_status = 'subscribed' THEN 'preferences_updated' ELSE 'resubscribed' END,
      v_version
    );

    RETURN jsonb_build_object('status', 'subscribed', 'id', v_subscriber_id);
  END IF;

  -- New subscriber insert
  INSERT INTO public.subscribers
    (first_name, email, phone_country_code, phone_number, preferred_contact_method, source, subscription_status, marketing_consent, consent_timestamp, consent_version, specific_cuts_note)
  VALUES
    (v_first, v_email, v_code, v_phone, v_method, v_source, 'subscribed', true, now(), v_version, v_note)
  RETURNING id INTO v_subscriber_id;

  INSERT INTO public.subscriber_interests (subscriber_id, interest_tag_id)
  SELECT v_subscriber_id, unnest(v_tag_ids);

  INSERT INTO public.subscription_events (subscriber_id, event_type, consent_version)
  VALUES (v_subscriber_id, 'subscribed', v_version);

  RETURN jsonb_build_object('status', 'subscribed', 'id', v_subscriber_id);
END;
$$;

REVOKE ALL ON FUNCTION public.subscribe_newsletter(text, text, text, text[], text, boolean, text, text, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text, text, text, text[], text, boolean, text, text, text, text, text) TO service_role;

-- -----------------------------------------------------------------------------
-- 10. RPC Functions: update_subscriber_profile
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_subscriber_profile(
  p_subscriber_id      uuid DEFAULT null,
  p_email              text DEFAULT null,
  p_first_name         text DEFAULT null,
  p_last_name          text DEFAULT null,
  p_country            text DEFAULT null,
  p_phone_country_code text DEFAULT null,
  p_phone_number       text DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id          uuid := p_subscriber_id;
  v_email       text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_first       text := nullif(btrim(coalesce(p_first_name, '')), '');
  v_last        text := nullif(btrim(coalesce(p_last_name, '')), '');
  v_country     text := nullif(btrim(coalesce(p_country, '')), '');
  v_code        text := nullif(btrim(coalesce(p_phone_country_code, '')), '');
  v_phone       text := nullif(regexp_replace(coalesce(p_phone_number, ''), '\D', '', 'g'), '');
  v_conflict_id uuid;
  v_exists      boolean;
BEGIN
  IF v_code = '+91' AND v_phone ~ '^0+' THEN
    v_phone := regexp_replace(v_phone, '^0+', '');
  END IF;

  IF v_id IS NULL THEN
    RETURN jsonb_build_object('status', 'invalid', 'reason', 'subscriber_id_required');
  END IF;

  SELECT exists(SELECT 1 FROM public.subscribers WHERE id = v_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_phone IS NOT NULL AND v_code IS NOT NULL THEN
    SELECT id INTO v_conflict_id
      FROM public.subscribers
     WHERE phone_country_code = v_code AND phone_number = v_phone AND id <> v_id
     LIMIT 1;

    IF v_conflict_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'conflict',
        'reason', 'phone_already_in_use'
      );
    END IF;
  END IF;

  IF v_email IS NOT NULL THEN
    SELECT id INTO v_conflict_id
      FROM public.subscribers
     WHERE email = v_email AND id <> v_id
     LIMIT 1;

    IF v_conflict_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'conflict',
        'reason', 'email_already_in_use'
      );
    END IF;
  END IF;

  UPDATE public.subscribers
     SET first_name         = coalesce(v_first, first_name),
         last_name          = coalesce(v_last, last_name),
         country            = coalesce(v_country, country),
         email              = coalesce(v_email, email),
         phone_country_code = coalesce(v_code, phone_country_code),
         phone_number       = coalesce(v_phone, phone_number),
         updated_at         = now()
   WHERE id = v_id;

  RETURN jsonb_build_object('status', 'updated');
END;
$$;

REVOKE ALL ON FUNCTION public.update_subscriber_profile(uuid, text, text, text, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscriber_profile(uuid, text, text, text, text, text, text) TO service_role;

-- Backward-compatible wrapper for 6-argument callers
CREATE OR REPLACE FUNCTION public.update_subscriber_profile(
  p_subscriber_id      uuid DEFAULT null,
  p_email              text DEFAULT null,
  p_first_name         text DEFAULT null,
  p_last_name          text DEFAULT null,
  p_phone_country_code text DEFAULT null,
  p_phone_number       text DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN public.update_subscriber_profile(
    p_subscriber_id,
    p_email,
    p_first_name,
    p_last_name,
    null,
    p_phone_country_code,
    p_phone_number
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_subscriber_profile(uuid, text, text, text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscriber_profile(uuid, text, text, text, text, text) TO service_role;
