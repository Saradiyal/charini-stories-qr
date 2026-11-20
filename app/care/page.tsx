import { Suspense } from "react";
import type { Metadata } from "next";
import CareInstructionsClient from "@/components/CareInstructionsClient";

export const metadata: Metadata = {
  title: "Garment Care Guide — CHARINI",
  description:
    "Preserve the beauty and longevity of your CHARINI wearable art. Detailed care instructions for 100% Cotton, Blended Silk, and Artisan Batik.",
};

export const dynamic = "force-dynamic";

export default function CarePage() {
  return (
    <Suspense
      fallback={
        <div className="editorial-canvas min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-charini-charcoal/20 border-t-charini-charcoal rounded-full animate-spin" />
        </div>
      }
    >
      <CareInstructionsClient />
    </Suspense>
  );
}
