"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { COPY } from "@/lib/config/constants";

export default function HeroSection() {
  return (
    <header className="w-full flex flex-col items-center justify-center text-center pt-8 pb-5 sm:pt-10 sm:pb-6">
      {/* Primary Brand Mark in a refined Deep Green #033431 boutique accent plaque */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full relative flex flex-col items-center justify-center px-6 py-7 sm:py-8 rounded-sm bg-brand-green text-brand-neutral-bg shadow-[0_4px_24px_rgba(3,52,49,0.12)] border border-brand-green/30"
      >
        <Image
          src="/charinistorieslogo.svg"
          alt="CHARINI Stories"
          width={240}
          height={161}
          priority
          className="h-auto w-44 sm:w-52 md:w-56 max-w-full select-none"
        />

        {/* Short supporting line */}
        <p className="mt-4 text-[11px] sm:text-xs font-sans tracking-[0.24em] uppercase text-brand-neutral-bg/85 font-light">
          {COPY.tagline}
        </p>
      </motion.div>
    </header>
  );
}
