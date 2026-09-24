"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { COPY } from "@/lib/config/constants";

export default function HeroSection() {
  return (
    <header className="flex flex-col items-center justify-center text-center pt-8 pb-7 sm:pt-12 sm:pb-8">
      {/* Primary Brand Mark */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative flex items-center justify-center"
      >
        <Image
          src="/charinistorieslogo.svg"
          alt="CHARINI Stories"
          width={240}
          height={161}
          priority
          className="h-auto w-44 sm:w-52 md:w-56 max-w-full select-none"
        />
      </motion.div>

      {/* Short supporting line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
        className="mt-3 text-xs sm:text-sm font-sans tracking-[0.22em] uppercase text-brand-gold/75 font-light"
      >
        {COPY.tagline}
      </motion.p>
    </header>
  );
}
