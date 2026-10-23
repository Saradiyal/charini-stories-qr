/**
 * Shared contract between the /api/subscribe route handler and the browser.
 * Contains no secrets and no database details.
 */

export interface InterestTag {
  slug: string;
  label: string;
}

export interface SubscribeRequestBody {
  email: string;
  interests: string[];
  specificCutsNote?: string | null;
  marketingConsent: boolean;
  /** Milliseconds between form render and submit (light bot heuristic). */
  elapsedMs?: number;
}

export type SubscribeErrorCode =
  | "email_required"
  | "invalid_email"
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

export type SubscribeField = "email" | "stores" | "interests" | "specificCutsNote" | "consent";

export type SubscribeResponse =
  | { ok: true }
  | { ok: false; code: SubscribeErrorCode; field?: SubscribeField };

/** Visitor-facing copy for every outcome. Never includes internal details. */
export const ERROR_MESSAGES: Record<SubscribeErrorCode | "network", string> = {
  email_required: "Please enter your email address.",
  invalid_email: "Please enter a valid email address.",
  store_required: "Please select at least one store (CHARINI or CHARINI STORIES).",
  consent_required: "Please confirm you\u2019d like to receive our emails.",
  interests_required: "Please choose at least one update.",
  invalid_interests: "Please choose from the options shown.",
  note_too_long: "Please keep this under 500 characters.",
  already_subscribed: "This email address is already subscribed.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  invalid_request: "Something went wrong. Please try again.",
  unavailable: "Subscriptions are temporarily unavailable. Please try again later.",
  server_error: "Something went wrong on our side. Please try again shortly.",
  network: "We couldn\u2019t connect. Please check your connection and try again.",
};
