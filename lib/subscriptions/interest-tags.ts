import "server-only";
import { getPublicServerClient } from "@/lib/supabase/server";
import type { InterestTag } from "@/lib/subscriptions/contract";

export const DEFAULT_TAGS: InterestTag[] = [
  { slug: "charini", label: "CHARINI" },
  { slug: "charini-stories", label: "CHARINI STORIES" },
  { slug: "new-prints", label: "New Prints" },
  { slug: "new-cuts", label: "New Cuts" },
  { slug: "collections", label: "Collections" },
  { slug: "special-releases", label: "Special Releases" },
  { slug: "specific-cuts", label: "Specific Cuts" },
  { slug: "versatile-skirts", label: "Versatile Skirts" },
  { slug: "wrap-around-skirts", label: "Wrap Around Skirts" },
  { slug: "shirt-dresses", label: "Shirt Dresses" },
  { slug: "fit-and-flare", label: "Fit and Flare" },
  { slug: "shirts", label: "Shirts" },
];

/**
 * Loads the active interest tags from the database (the source of truth).
 * Falls back to canonical tags if database lookup fails.
 */
export async function getActiveInterestTags(): Promise<InterestTag[]> {
  const supabase = getPublicServerClient();
  if (!supabase) {
    return DEFAULT_TAGS;
  }

  try {
    const { data, error } = await supabase
      .from("interest_tags")
      .select("slug, label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_TAGS;
    }

    return data.map((row) => ({ slug: String(row.slug), label: String(row.label) }));
  } catch {
    return DEFAULT_TAGS;
  }
}
