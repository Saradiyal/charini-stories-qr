import "server-only";
import { z } from "zod";
import { LIMITS, SPECIFIC_CUTS_SLUG, STORE_SLUGS } from "@/lib/config";
import type { SubscribeErrorCode, SubscribeField } from "@/lib/subscriptions/contract";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const subscribeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(100)
    .nullish()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(LIMITS.emailMax, { error: "invalid_email" })
    .nullish()
    .transform((v) => (v && v.trim().length > 0 ? v.trim().toLowerCase() : null)),
  phoneCountryCode: z
    .string()
    .trim()
    .max(8)
    .nullish()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  phoneNumber: z
    .string()
    .trim()
    .max(25)
    .nullish()
    .transform((v) => {
      if (!v) return null;
      const digits = v.replace(/\D/g, "");
      return digits.length > 0 ? digits : null;
    }),
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
  source: z
    .string()
    .trim()
    .max(100)
    .nullish()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : "Mumbai Pop-up")),
  preferredContactMethod: z
    .enum(["whatsapp", "email"])
    .nullish()
    .transform((v) => v || "whatsapp"),
  botTrap: z.string().max(100).optional(),
  elapsedMs: z.number().finite().nonnegative().optional(),
});

export type ValidSubscription = {
  firstName: string | null;
  email: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  interests: string[];
  specificCutsNote: string | null;
  marketingConsent: true;
  source: string;
  preferredContactMethod: string;
};

export type ValidationOutcome =
  | { ok: true; data: ValidSubscription; tooFast: boolean }
  | { ok: false; code: SubscribeErrorCode; field?: SubscribeField };

const FIELD_BY_PATH: Record<string, SubscribeField> = {
  firstName: "firstName",
  email: "email",
  phone: "phone",
  phoneNumber: "phone",
  contact: "contact",
  stores: "stores",
  interests: "interests",
  specificCutsNote: "specificCutsNote",
  marketingConsent: "consent",
};

const KNOWN_CODES = new Set<SubscribeErrorCode>([
  "first_name_required",
  "contact_required",
  "email_required",
  "invalid_email",
  "phone_required",
  "invalid_phone",
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

  const {
    firstName,
    email,
    phoneCountryCode,
    phoneNumber,
    interests,
    specificCutsNote,
    marketingConsent,
    source,
    preferredContactMethod,
    botTrap,
    elapsedMs,
  } = parsed.data;

  // Anti-bot honeypot check
  if (botTrap && botTrap.trim().length > 0) {
    return { ok: false, code: "invalid_request" };
  }

  // First name is required
  if (!firstName || firstName.trim().length === 0) {
    return { ok: false, code: "first_name_required", field: "firstName" };
  }

  // At least one contact channel (email or phone) is required
  if (!email && !phoneNumber) {
    return { ok: false, code: "contact_required", field: "contact" };
  }

  // If email is provided, validate its format
  if (email && (!EMAIL_REGEX.test(email) || email.length < 3)) {
    return { ok: false, code: "invalid_email", field: "email" };
  }

  // If phone is provided, validate length and strip any leading trunk zeros
  let cleanPhone = phoneNumber;
  let cleanCode = phoneCountryCode || "+94";
  if (cleanPhone) {
    cleanPhone = cleanPhone.replace(/^0+/, "");
    if (cleanPhone.length < 6 || cleanPhone.length > 15) {
      return { ok: false, code: "invalid_phone", field: "phone" };
    }
  }

  // At least one brand (CHARINI or CHARINI STORIES) must be selected.
  const hasStore = interests.some((slug) => (STORE_SLUGS as readonly string[]).includes(slug));
  if (!hasStore) {
    return { ok: false, code: "store_required", field: "stores" };
  }

  // Sanitize and validate additional note
  let finalInterests = [...interests];
  let note: string | null = null;
  if (specificCutsNote && specificCutsNote.trim().length > 0) {
    // Strip control characters and collapse excessive newlines
    const cleanNote = specificCutsNote
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleanNote.length > LIMITS.specificCutsNoteMax) {
      return { ok: false, code: "note_too_long", field: "specificCutsNote" };
    }

    if (cleanNote.length > 0) {
      note = cleanNote;
      // Auto-include SPECIFIC_CUTS_SLUG to ensure database stored procedure saves the note
      if (!finalInterests.includes(SPECIFIC_CUTS_SLUG)) {
        finalInterests.push(SPECIFIC_CUTS_SLUG);
      }
    }
  }

  return {
    ok: true,
    data: {
      firstName: firstName || null,
      email: email || null,
      phoneCountryCode: cleanPhone ? cleanCode : null,
      phoneNumber: cleanPhone || null,
      interests: finalInterests,
      specificCutsNote: note,
      marketingConsent,
      source: source || "Mumbai Pop-up",
      preferredContactMethod: preferredContactMethod || "whatsapp",
    },
    tooFast: typeof elapsedMs === "number" && elapsedMs < LIMITS.minFillMs,
  };
}
