import "server-only";
import { CONSENT_VERSION } from "@/lib/config";
import { getSecretServerClient } from "@/lib/supabase/server";
import type { SubscribeErrorCode } from "@/lib/subscriptions/contract";
import type { ValidSubscription } from "@/lib/subscriptions/validation";

export type SubscribeOutcome =
  | { ok: true; status: "subscribed" | "resubscribed"; subscriberId?: string }
  | { ok: false; code: SubscribeErrorCode };

type RpcResult = { status?: string; reason?: string; id?: string } | null;

const INVALID_REASONS = new Set<SubscribeErrorCode>([
  "contact_required",
  "email_required",
  "invalid_email",
  "phone_required",
  "invalid_phone",
  "consent_required",
  "interests_required",
  "invalid_interests",
  "note_too_long",
  "invalid_request",
]);

const DEFAULT_CAMPAIGN = "Mumbai Pop-up";

/**
 * Validates campaign input strictly against registered campaigns in the database.
 * Rejects arbitrary strings to prevent attribution tampering, falling back to the canonical default.
 */
async function resolveCanonicalCampaign(
  source: string,
  supabase: NonNullable<ReturnType<typeof getSecretServerClient>>
): Promise<string> {
  const trimmed = source.trim();
  if (!trimmed) return DEFAULT_CAMPAIGN;

  try {
    const { data: campaigns } = await (supabase.from("campaigns" as any) as any)
      .select("name, slug, is_default");

    if (campaigns && campaigns.length > 0) {
      const cleanSrc = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const camp of campaigns as Array<{ name: string; slug: string; is_default?: boolean }>) {
        const cleanName = camp.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanSlug = camp.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanSrc === cleanName || cleanSrc === cleanSlug) {
          return camp.name;
        }
      }

      // Use default campaign configured in database if available
      const defaultCamp = (campaigns as Array<{ name: string; is_default?: boolean }>).find(
        (c) => c.is_default
      );
      if (defaultCamp) return defaultCamp.name;
    }
  } catch (err) {
    console.error("[service.ts] Campaign lookup error:", err);
  }

  // Reject unrecognized arbitrary strings and default securely
  return DEFAULT_CAMPAIGN;
}

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

  const resolvedSource = await resolveCanonicalCampaign(data.source, supabase);

  const { data: result, error } = await supabase.rpc("subscribe_newsletter", {
    p_email: data.email,
    p_phone_country_code: data.phoneCountryCode,
    p_phone_number: data.phoneNumber,
    p_interest_slugs: data.interests,
    p_specific_cuts_note: data.specificCutsNote,
    p_marketing_consent: data.marketingConsent,
    p_consent_version: CONSENT_VERSION,
    p_rate_key: rateKey,
    p_first_name: data.firstName,
    p_source: resolvedSource,
    p_preferred_contact_method: data.preferredContactMethod,
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
      return { ok: true, status: outcome.status, subscriberId: outcome.id };
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
