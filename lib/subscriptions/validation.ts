import "server-only";
import { z } from "zod";
import { LIMITS, SPECIFIC_CUTS_SLUG, STORE_SLUGS } from "@/lib/config";
import type { SubscribeErrorCode, SubscribeField } from "@/lib/subscriptions/contract";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const subscribeSchema = z.object({
  email: z
    .string({ error: "email_required" })
    .trim()
    .toLowerCase()
    .min(1, { error: "email_required" })
    .max(LIMITS.emailMax, { error: "invalid_email" })
    .pipe(z.email({ error: "invalid_email" })),
  interests: z
    .array(
      z.string().max(LIMITS.slugMax, { error: "invalid_interests" }).regex(SLUG_PATTERN, {
        error: "invalid_interests",
      }),
      { error: "interests_required" },
    )
    .min(1, { error: "interests_required" })
    .max(LIMITS.maxInterests, { error: "invalid_interests" })
    .transform((list) => Array.from(new Set(list))),
  specificCutsNote: z
    .string({ error: "invalid_request" })
    .max(LIMITS.specificCutsNoteMax * 2, { error: "note_too_long" })
    .nullish()
    .transform((v) => (v ?? "").trim()),
  marketingConsent: z.literal(true, { error: "consent_required" }),
  elapsedMs: z.number().finite().nonnegative().optional(),
});

export type ValidSubscription = {
  email: string;
  interests: string[];
  specificCutsNote: string | null;
  marketingConsent: true;
};

export type ValidationOutcome =
  | { ok: true; data: ValidSubscription; tooFast: boolean }
  | { ok: false; code: SubscribeErrorCode; field?: SubscribeField };

const FIELD_BY_PATH: Record<string, SubscribeField> = {
  email: "email",
  stores: "stores",
  interests: "interests",
  specificCutsNote: "specificCutsNote",
  marketingConsent: "consent",
};

const KNOWN_CODES = new Set<SubscribeErrorCode>([
  "email_required",
  "invalid_email",
  "store_required",
  "consent_required",
  "interests_required",
  "invalid_interests",
  "note_too_long",
]);

export function validateSubscription(input: unknown): ValidationOutcome {
  const parsed = subscribeSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.message as SubscribeErrorCode | undefined;
    const code: SubscribeErrorCode = message && KNOWN_CODES.has(message) ? message : "invalid_request";
    const field = FIELD_BY_PATH[String(issue?.path?.[0] ?? "")];
    return { ok: false, code, field };
  }

  const { email, interests, specificCutsNote, marketingConsent, elapsedMs } = parsed.data;

  // At least one store (CHARINI or CHARINI STORIES) must be selected.
  const hasStore = interests.some((slug) => (STORE_SLUGS as readonly string[]).includes(slug));
  if (!hasStore) {
    return { ok: false, code: "store_required", field: "stores" };
  }

  // The note is only meaningful (and only stored) with the Specific Cuts tag.
  const note = interests.includes(SPECIFIC_CUTS_SLUG) && specificCutsNote ? specificCutsNote : null;
  if (note && note.length > LIMITS.specificCutsNoteMax) {
    return { ok: false, code: "note_too_long", field: "specificCutsNote" };
  }

  return {
    ok: true,
    data: { email, interests, specificCutsNote: note, marketingConsent },
    tooFast: typeof elapsedMs === "number" && elapsedMs < LIMITS.minFillMs,
  };
}
