"use client";

import HeroSection from "./HeroSection";
import SocialLinks from "./SocialLinks";
import NewsletterForm from "./NewsletterForm";
import { BRAND_LINKS } from "@/lib/config/constants";

interface ConnectPageProps {
  source?: string;
}

export default function ConnectPage({ source = "direct" }: ConnectPageProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen w-full bg-brand-neutral-bg luxury-vignette flex flex-col justify-between items-center selection:bg-brand-green selection:text-brand-neutral-bg">
      {/* Background subtle botanical warmth lighting */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[340px] rounded-full bg-brand-green/[0.04] blur-3xl" />
      </div>

      {/* Main Content Column (70-80% warm neutral space + 20-30% CHARINI green accents) */}
      <main className="relative z-10 w-full max-w-[440px] px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        {/* 1. Hero / Brand Header */}
        <HeroSection />

        {/* 2. Links Section */}
        <div className="w-full mt-2">
          <SocialLinks />
        </div>

        {/* 3. Newsletter Section */}
        <div className="w-full">
          <NewsletterForm source={source} />
        </div>

        {/* Minimal Subtle Footer */}
        <footer className="w-full pt-4 pb-8 text-center flex flex-col items-center gap-1.5">
          <p className="text-[11px] sm:text-xs font-sans tracking-[0.16em] uppercase text-brand-green font-medium">
            {BRAND_LINKS.location}
          </p>
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.2em] uppercase text-brand-muted/75">
            CHARINI Stories &bull; {currentYear}
          </p>
        </footer>
      </main>
    </div>
  );
}
