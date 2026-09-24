export type NewsletterPreference =
  | "new_prints"
  | "new_cuts"
  | "new_collections"
  | "limited_drops"
  | "promotions"
  | "events";

export interface PreferenceOption {
  id: NewsletterPreference;
  label: string;
  description?: string;
}

export interface NewsletterSubmission {
  email: string;
  preferences: NewsletterPreference[];
  source: string;
}

export interface NewsletterApiResponse {
  success: boolean;
  isExistingSubscriber?: boolean;
  message: string;
  error?: string;
}
