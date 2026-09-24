import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NewsletterSubmission, NewsletterApiResponse } from "../types";
import { COPY } from "../config/constants";

// In-memory fallback cache for development or when Supabase keys are not set
interface MemorySubscriber {
  id: string;
  email: string;
  preferences: string[];
  source: string;
  created_at: string;
  updated_at: string;
}

const memoryStore = new Map<string, MemorySubscriber>();

/**
 * Creates a server-side Supabase client using the private service role key.
 * This client is NEVER exposed to the browser.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("your-project")) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Saves or updates a newsletter subscriber.
 *
 * Rules:
 * - Email addresses are unique.
 * - If someone has already subscribed, update their preferences and return
 *   "You’re already subscribed — your preferences have been updated."
 * - If newly subscribed, return
 *   "You’re in. We’ll only send you the updates you choose."
 */
export async function saveSubscriber(
  submission: NewsletterSubmission
): Promise<NewsletterApiResponse> {
  const { email, preferences, source } = submission;
  const normalizedEmail = email.toLowerCase().trim();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    // Graceful in-memory fallback for local development / testing
    const now = new Date().toISOString();
    const existing = memoryStore.get(normalizedEmail);

    if (existing) {
      existing.preferences = preferences;
      existing.source = source || existing.source;
      existing.updated_at = now;
      memoryStore.set(normalizedEmail, existing);

      return {
        success: true,
        isExistingSubscriber: true,
        message: COPY.existingSubscriberMessage,
      };
    }

    const newSubscriber: MemorySubscriber = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`,
      email: normalizedEmail,
      preferences,
      source,
      created_at: now,
      updated_at: now,
    };
    memoryStore.set(normalizedEmail, newSubscriber);

    return {
      success: true,
      isExistingSubscriber: false,
      message: COPY.successMessage,
    };
  }

  try {
    // 1. Check for existing subscriber
    const { data: existing, error: selectError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, preferences")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Supabase select error:", selectError);
      return {
        success: false,
        message: COPY.errors.serverError,
        error: "Database error during lookup",
      };
    }

    const now = new Date().toISOString();

    if (existing) {
      // 2. Existing subscriber - update their preferences without throwing an error
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          preferences,
          source: source || "direct",
          updated_at: now,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return {
          success: false,
          message: COPY.errors.serverError,
          error: "Database error during update",
        };
      }

      return {
        success: true,
        isExistingSubscriber: true,
        message: COPY.existingSubscriberMessage,
      };
    }

    // 3. New subscriber - insert record
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        preferences,
        source: source || "direct",
        created_at: now,
        updated_at: now,
      });

    if (insertError) {
      // Check for race condition unique violation
      if (insertError.code === "23505") {
        // Retry as update
        const { error: fallbackUpdateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            preferences,
            source: source || "direct",
            updated_at: now,
          })
          .ilike("email", normalizedEmail);

        if (!fallbackUpdateError) {
          return {
            success: true,
            isExistingSubscriber: true,
            message: COPY.existingSubscriberMessage,
          };
        }
      }

      console.error("Supabase insert error:", insertError);
      return {
        success: false,
        message: COPY.errors.serverError,
        error: "Database error during insertion",
      };
    }

    return {
      success: true,
      isExistingSubscriber: false,
      message: COPY.successMessage,
    };
  } catch (err) {
    console.error("Unexpected error in saveSubscriber:", err);
    return {
      success: false,
      message: COPY.errors.serverError,
      error: "Unexpected server error",
    };
  }
}
