"use client";

import HeroSection from "./HeroSection";
import SocialLinks from "./SocialLinks";
import NewsletterForm from "./NewsletterForm";

interface ConnectPageProps {
  source?: string;
}

export default function ConnectPage({ source = "direct" }: ConnectPageProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen w-full bg-brand-bg luxury-vignette flex flex-col justify-between items-center selection:bg-brand-gold/20 selection:text-brand-cream">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[340px] rounded-full bg-brand-gold/[0.04] blur-3xl" />
      </div>

      {/* Main Content Column */}
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
          <p className="text-[11px] sm:text-xs font-sans tracking-[0.16em] uppercase text-brand-gold/85 font-light">
            Shop 36, Level 2 &bull; One Galle Face
          </p>
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.2em] uppercase text-brand-text-dim/60">
            CHARINI Stories &bull; {currentYear}
          </p>
        </footer>
      </main>
    </div>
  );
}
