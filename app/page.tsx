import NewsletterSignup from "@/components/NewsletterSignup";
import { getActiveInterestTags } from "@/lib/subscriptions/interest-tags";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tags = await getActiveInterestTags();

  return (
    <div className="editorial-canvas min-h-screen flex flex-col justify-between">
      <NewsletterSignup initialTags={tags} />
    </div>
  );
}
