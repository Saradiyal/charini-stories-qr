"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Globe, MessageCircle, Phone, ArrowUpRight } from "lucide-react";
import { BRAND_LINKS } from "@/lib/config/constants";

// Simple Lucide Instagram icon (official Lucide geometry)
function LucideInstagram({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface LinkItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal: boolean;
}

const LINKS: LinkItem[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: BRAND_LINKS.instagram,
    icon: LucideInstagram,
    isExternal: true,
  },
  {
    id: "website",
    label: "Visit CHARINI Stories",
    href: BRAND_LINKS.website,
    icon: Globe,
    isExternal: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp Us",
    href: BRAND_LINKS.whatsapp,
    icon: MessageCircle,
    isExternal: true,
  },
  {
    id: "contact",
    label: "Contact Us",
    href: BRAND_LINKS.contact,
    icon: Phone,
    isExternal: false,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function SocialLinks() {
  return (
    <section aria-label="Brand links and channels" className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2.5 sm:gap-3"
      >
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.id}
              variants={itemVariants}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <a
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
                className="group relative flex w-full items-center justify-between px-5 py-3.5 sm:py-4 rounded-sm bg-brand-white hover:bg-brand-cream border border-brand-green/20 hover:border-brand-green/45 transition-colors duration-250 ease-out focus-visible:border-brand-green focus-visible:ring-1 focus-visible:ring-brand-green/40 shadow-[0_2px_8px_rgba(3,52,49,0.04)] cursor-pointer"
              >
                {/* Left Icon in #033431 */}
                <div className="flex items-center justify-center w-5 h-5 text-brand-green">
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>

                {/* Centered / Balanced Label in #033431 */}
                <span className="text-[13px] sm:text-sm font-sans font-medium tracking-[0.08em] text-brand-green uppercase">
                  {link.label}
                </span>

                {/* Right Arrow indicator in #033431 */}
                <div className="flex items-center justify-center w-5 h-5 text-brand-green/50 group-hover:text-brand-green transition-colors duration-200">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
