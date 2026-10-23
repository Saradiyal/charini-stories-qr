import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase clients.
 *
 * - `getPublicServerClient` uses the publishable key (anon role). It can only
 *   read active interest tags — enforced by RLS + privileges in the database.
 * - `getSecretServerClient` uses the secret key (service_role). It must only
 *   be used by lib/subscriptions/service.ts to call subscribe_newsletter().
 *   The key never leaves the server: this module imports "server-only", and the
 *   variable has no NEXT_PUBLIC_ prefix so it is never bundled for the browser.
 */

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
} as const;

function readUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.startsWith("https://") ? url : null;
}

let publicClient: SupabaseClient | null = null;
let secretClient: SupabaseClient | null = null;

export function getPublicServerClient(): SupabaseClient | null {
  if (publicClient) return publicClient;
  const url = readUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  publicClient = createClient(url, key, clientOptions);
  return publicClient;
}

export function getSecretServerClient(): SupabaseClient | null {
  if (secretClient) return secretClient;
  const url = readUrl();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  secretClient = createClient(url, key, clientOptions);
  return secretClient;
}
