/**
 * Public, non-secret configuration shared by client and server code.
 */

/**
 * Bump this whenever the consent wording below changes, and record the new
 * wording in docs/DATABASE_SCHEMA.md. Stored with every subscription.
 */
export const CONSENT_VERSION = "2026-10-v1";

export const CONSENT_TEXT =
  "I agree to receive marketing emails from CHARINI about the updates I\u2019ve selected.";

/** Placeholder until the final privacy policy is supplied. */
export const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL || "/privacy";

export const SPECIFIC_CUTS_SLUG = "specific-cuts";
export const STORE_SLUGS = ["charini", "charini-stories"] as const;

export const CUT_TYPE_SLUGS = [
  "versatile-skirts",
  "wrap-around-skirts",
  "shirt-dresses",
  "fit-and-flare",
  "shirts",
] as const;

export const CUT_TYPE_OPTIONS = [
  { slug: "versatile-skirts", label: "Versatile Skirts" },
  { slug: "wrap-around-skirts", label: "Wrap Around Skirts" },
  { slug: "shirt-dresses", label: "Shirt Dresses" },
  { slug: "fit-and-flare", label: "Fit and Flare" },
  { slug: "shirts", label: "Shirts" },
] as const;

export const LIMITS = {
  emailMax: 254,
  specificCutsNoteMax: 500,
  additionalNotesUiMax: 300,
  maxInterests: 20,
  slugMax: 64,
  requestBodyBytes: 8 * 1024,
  /** Submissions faster than this after page load are treated as automated. */
  minFillMs: 1200,
} as const;
