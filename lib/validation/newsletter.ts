import { NewsletterPreference, NewsletterSubmission } from "../types";

const VALID_PREFERENCES: Set<NewsletterPreference> = new Set([
  "new_prints",
  "new_cuts",
  "new_collections",
  "limited_drops",
  "promotions",
  "events",
]);

// Standard robust email pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: NewsletterSubmission;
}

export function validateEmail(email: unknown): { isValid: boolean; sanitized: string } {
  if (typeof email !== "string") {
    return { isValid: false, sanitized: "" };
  }
  const sanitized = email.trim().toLowerCase();
  if (!sanitized || sanitized.length > 254) {
    return { isValid: false, sanitized: "" };
  }
  return { isValid: EMAIL_REGEX.test(sanitized), sanitized };
}

export function validatePreferences(preferences: unknown): {
  isValid: boolean;
  sanitized: NewsletterPreference[];
} {
  if (!Array.isArray(preferences)) {
    return { isValid: false, sanitized: [] };
  }

  const sanitized: NewsletterPreference[] = [];
  for (const item of preferences) {
    if (typeof item === "string" && VALID_PREFERENCES.has(item as NewsletterPreference)) {
      if (!sanitized.includes(item as NewsletterPreference)) {
        sanitized.push(item as NewsletterPreference);
      }
    }
  }

  return {
    isValid: sanitized.length > 0,
    sanitized,
  };
}

export function sanitizeSource(source: unknown): string {
  if (typeof source !== "string") {
    return "direct";
  }
  const clean = source.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return clean.slice(0, 50) || "direct";
}

export function validateNewsletterSubmission(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid request payload." };
  }

  const record = body as Record<string, unknown>;

  const { isValid: emailValid, sanitized: email } = validateEmail(record.email);
  if (!emailValid) {
    return {
      isValid: false,
      error: "Please enter a valid email address.",
    };
  }

  const { isValid: prefsValid, sanitized: preferences } = validatePreferences(record.preferences);
  if (!prefsValid) {
    return {
      isValid: false,
      error: "Please choose at least one type of update.",
    };
  }

  const source = sanitizeSource(record.source);

  return {
    isValid: true,
    data: {
      email,
      preferences,
      source,
    },
  };
}
