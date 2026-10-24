/**
 * Shared contract between the /api/subscribe route handler and the browser.
 * Contains no secrets and no database details.
 */

export interface InterestTag {
  slug: string;
  label: string;
}

export interface SubscribeRequestBody {
  firstName?: string | null;
  email?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  interests: string[];
  specificCutsNote?: string | null;
  marketingConsent: boolean;
  source?: string | null;
  preferredContactMethod?: "whatsapp" | "email" | null;
  /** Milliseconds between form render and submit (light bot heuristic). */
  elapsedMs?: number;
}

export type SubscribeErrorCode =
  | "first_name_required"
  | "contact_required"
  | "email_required"
  | "invalid_email"
  | "phone_required"
  | "invalid_phone"
  | "store_required"
  | "consent_required"
  | "interests_required"
  | "invalid_interests"
  | "note_too_long"
  | "already_subscribed"
  | "rate_limited"
  | "invalid_request"
  | "unavailable"
  | "server_error";

export type SubscribeField =
  | "firstName"
  | "contact"
  | "email"
  | "phone"
  | "stores"
  | "interests"
  | "specificCutsNote"
  | "consent";

export type SubscribeResponse =
  | { ok: true; subscriberId?: string }
  | { ok: false; code: SubscribeErrorCode; field?: SubscribeField };

/** Visitor-facing copy for every outcome. Never includes internal details. */
export const ERROR_MESSAGES: Record<SubscribeErrorCode | "network", string> = {
  first_name_required: "Please enter your name.",
  contact_required: "Please provide an email or mobile number.",
  email_required: "Please enter your email address.",
  invalid_email: "Please enter a valid email address.",
  phone_required: "Please enter your mobile number.",
  invalid_phone: "Please enter a valid mobile number.",
  store_required: "Please select at least one brand (CHARINI or CHARINI STORIES).",
  consent_required: "Please confirm your consent to receive updates.",
  interests_required: "Please choose at least one brand.",
  invalid_interests: "Please choose from the options shown.",
  note_too_long: "Please keep this under 500 characters.",
  already_subscribed: "You are already subscribed. We\u2019ve updated your preferences.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  invalid_request: "Something went wrong. Please try again.",
  unavailable: "Subscriptions are temporarily unavailable. Please try again later.",
  server_error: "Something went wrong on our side. Please try again shortly.",
  network: "We couldn\u2019t connect. Please check your connection and try again.",
};
