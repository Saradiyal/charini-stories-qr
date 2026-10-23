import "server-only";
import { CONSENT_VERSION } from "@/lib/config";
import { getSecretServerClient } from "@/lib/supabase/server";
import type { SubscribeErrorCode } from "@/lib/subscriptions/contract";
import type { ValidSubscription } from "@/lib/subscriptions/validation";

export type SubscribeOutcome =
  | { ok: true; status: "subscribed" | "resubscribed" }
  | { ok: false; code: SubscribeErrorCode };

type RpcResult = { status?: string; reason?: string } | null;

const INVALID_REASONS = new Set<SubscribeErrorCode>([
  "invalid_email",
  "consent_required",
  "interests_required",
  "invalid_interests",
  "note_too_long",
  "invalid_request",
]);

/**
 * Persists a validated subscription through the atomic, service-role-only
 * database function. This is the public site's ONLY database write, and the
 * public site performs no reads of subscriber data at all.
 */
export async function subscribe(
  data: ValidSubscription,
  rateKey: string,
): Promise<SubscribeOutcome> {
  const supabase = getSecretServerClient();
  if (!supabase) {
    console.error("[subscribe] Supabase secret configuration is missing.");
    return { ok: false, code: "unavailable" };
  }

  const { data: result, error } = await supabase.rpc("subscribe_newsletter", {
    p_email: data.email,
    p_interest_slugs: data.interests,
    p_specific_cuts_note: data.specificCutsNote,
    p_marketing_consent: data.marketingConsent,
    p_consent_version: CONSENT_VERSION,
    p_rate_key: rateKey,
  });

  if (error) {
    // Log server-side only; visitors get a generic message.
    console.error("[subscribe] RPC failed:", error.code, error.message);
    return { ok: false, code: "server_error" };
  }

  const outcome = result as RpcResult;
  switch (outcome?.status) {
    case "subscribed":
    case "resubscribed":
      return { ok: true, status: outcome.status };
    case "already_subscribed":
      return { ok: false, code: "already_subscribed" };
    case "rate_limited":
      return { ok: false, code: "rate_limited" };
    case "invalid": {
      const reason = outcome.reason as SubscribeErrorCode | undefined;
      return { ok: false, code: reason && INVALID_REASONS.has(reason) ? reason : "invalid_request" };
    }
    default:
      console.error("[subscribe] Unexpected RPC result shape.");
      return { ok: false, code: "server_error" };
  }
}
