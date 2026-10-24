import { Suspense } from "react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getActiveInterestTags } from "@/lib/subscriptions/interest-tags";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tags = await getActiveInterestTags();

  return (
    <div className="editorial-canvas min-h-screen flex flex-col justify-between">
      <Suspense
        fallback={
          <div className="w-full min-h-[60vh] flex items-center justify-center font-serif text-charini-charcoal-muted">
            <span className="w-5 h-5 border-2 border-charini-charcoal/20 border-t-charini-charcoal rounded-full animate-spin" />
          </div>
        }
      >
        <NewsletterSignup initialTags={tags} />
      </Suspense>
    </div>
  );
}
