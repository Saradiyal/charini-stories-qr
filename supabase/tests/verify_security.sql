-- =============================================================================
-- CHARINI — security verification (read-only; everything is rolled back)
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/verify_security.sql
-- Raises an exception (non-zero exit) if any check fails.
-- =============================================================================
begin;

-- 1. RLS enabled on every exposed table
do $$
declare r record;
begin
  for r in
    select c.relname, c.relrowsecurity
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname in ('interest_tags','subscribers','subscriber_interests','subscription_events')
  loop
    if not r.relrowsecurity then
      raise exception 'FAIL: RLS disabled on %', r.relname;
    end if;
  end loop;
  raise notice 'PASS: RLS enabled on all exposed tables';
end $$;

-- 2. Privilege matrix for browser-facing roles
do $$
declare
  role_name text;
  tbl text;
  priv text;
begin
  foreach role_name in array array['anon','authenticated'] loop
    foreach tbl in array array['public.subscribers','public.subscriber_interests',
                               'public.subscription_events','public.subscriber_overview'] loop
      foreach priv in array array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'] loop
        if has_table_privilege(role_name, tbl, priv) then
          raise exception 'FAIL: % has % on %', role_name, priv, tbl;
        end if;
      end loop;
    end loop;

    foreach priv in array array['INSERT','UPDATE','DELETE','TRUNCATE'] loop
      if has_table_privilege(role_name, 'public.interest_tags', priv) then
        raise exception 'FAIL: % has % on public.interest_tags', role_name, priv;
      end if;
    end loop;

    if has_function_privilege(role_name,
         'public.subscribe_newsletter(text, text[], text, boolean, text, text)', 'EXECUTE') then
      raise exception 'FAIL: % can execute subscribe_newsletter', role_name;
    end if;

    if has_schema_privilege(role_name, 'private', 'USAGE') then
      raise exception 'FAIL: % has usage on schema private', role_name;
    end if;
  end loop;
  raise notice 'PASS: anon/authenticated have no access to subscriber data or the signup function';
end $$;

-- 3. Behavioural checks while impersonating anon
set local role anon;

do $$
begin
  begin
    perform 1 from public.subscribers limit 1;
    raise exception 'FAIL: anon could select subscribers';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.subscriber_interests limit 1;
    raise exception 'FAIL: anon could select subscriber_interests';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.subscriber_overview limit 1;
    raise exception 'FAIL: anon could select subscriber_overview';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.subscribers (email) values ('probe@example.com');
    raise exception 'FAIL: anon could insert into subscribers';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.subscribe_newsletter('probe@example.com', array['charini'], null, true, 'v', null);
    raise exception 'FAIL: anon could call subscribe_newsletter';
  exception when insufficient_privilege then null;
  end;

  if exists (select 1 from public.interest_tags where not is_active) then
    raise exception 'FAIL: anon can see inactive interest tags';
  end if;

  raise notice 'PASS: anon behavioural checks';
end $$;

reset role;
rollback;
