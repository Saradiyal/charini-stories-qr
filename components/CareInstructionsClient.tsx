"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FabricType = "cotton" | "silk" | "batik";

interface CareSection {
  title: string;
  icon: React.ReactNode;
  details: string[];
}

interface CareSymbol {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

interface FabricCareData {
  id: FabricType;
  name: string;
  description: string;
  symbols: CareSymbol[];
  sections: CareSection[];
  dos: string[];
  donts: string[];
}

// Precision SVG International Laundry Symbols (ISO 3758 Luxury Line-Art)
const LaundryIcons = {
  wash30: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5h18l-1.8 10.2A2 2 0 0117.2 20H6.8a2 2 0 01-1.98-1.3L3 8.5z" />
      <path d="M3 8.5c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" strokeDasharray="1 1.5" />
      <text x="12" y="16" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="currentColor" stroke="none" fontFamily="sans-serif">30°</text>
    </svg>
  ),
  washHand: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5h18l-1.8 9.2A2 2 0 0117.2 20H6.8a2 2 0 01-1.98-1.3L3 9.5z" />
      <path d="M12 4v4m-2-3l2-2 2 2" />
      <path d="M9.5 7.5a1.5 1.5 0 013 0v4.5" />
    </svg>
  ),
  washGentle: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5h18l-1.8 10.2A2 2 0 0117.2 20H6.8a2 2 0 01-1.98-1.3L3 8.5z" />
      <path d="M4 22h16" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="6" fontWeight="600" fill="currentColor" stroke="none" fontFamily="sans-serif">COLD</text>
    </svg>
  ),
  doNotBleach: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5L2.5 20h19L12 3.5z" />
      <path d="M4.5 6.5l15 13.5" />
      <path d="M19.5 6.5L4.5 20" />
    </svg>
  ),
  lineDryShade: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M4.5 9l4.5-4.5M4.5 13l8.5-8.5" />
      <path d="M4 4.5c4 2.5 12 2.5 16 0" />
    </svg>
  ),
  flatDryShade: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M4.5 9l4.5-4.5M4.5 13l8.5-8.5" />
      <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2} />
    </svg>
  ),
  ironMedium: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h17a2.5 2.5 0 002.5-2.5c0-3.5-3-5.5-7.5-5.5H3v8z" />
      <path d="M5 9V6h10" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
      <circle cx="14" cy="14" r="0.9" fill="currentColor" />
    </svg>
  ),
  ironLow: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h17a2.5 2.5 0 002.5-2.5c0-3.5-3-5.5-7.5-5.5H3v8z" />
      <path d="M5 9V6h10" />
      <circle cx="12" cy="14" r="0.9" fill="currentColor" />
    </svg>
  ),
  dryCleanP: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor" stroke="none" fontFamily="sans-serif">P</text>
    </svg>
  ),
  noTumble: (
    <svg className="w-5 h-5 text-charini-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <circle cx="12" cy="12" r="6" />
      <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
      <line x1="19.5" y1="4.5" x2="4.5" y2="19.5" />
    </svg>
  ),
};

const CARE_DATA: Record<FabricType, FabricCareData> = {
  cotton: {
    id: "cotton",
    name: "100% Cotton",
    description:
      "Crafted from 100% natural cotton fibers, our pieces offer effortless ease, breathability, and enduring comfort. Natural cotton softens gracefully with each wash when nurtured with gentle, mindful care.",
    symbols: [
      { label: "Cold Wash", sublabel: "Max 30°C", icon: LaundryIcons.wash30 },
      { label: "Do Not Bleach", sublabel: "No Chlorine", icon: LaundryIcons.doNotBleach },
      { label: "Line Dry", sublabel: "In Shade", icon: LaundryIcons.lineDryShade },
      { label: "Medium Iron", sublabel: "Warm / Steam", icon: LaundryIcons.ironMedium },
      { label: "Dry Cleanable", sublabel: "Standard P", icon: LaundryIcons.dryCleanP },
    ],
    sections: [
      {
        title: "Washing & Cleansing",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
        details: [
          "Hand wash or use a gentle, low-spin cycle in cold or lukewarm water (max 30°C / 85°F).",
          "Use a mild, pH-neutral liquid detergent formulated for fine natural cotton.",
          "Wash like colors together. Turn printed garments inside out before washing to safeguard pigments.",
          "Avoid harsh powdered detergents, optical brighteners, and chlorine bleach.",
        ],
      },
      {
        title: "Drying & Moisture",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        details: [
          "Gently reshape the garment while still damp and line-dry naturally in shaded breeze.",
          "Avoid direct midday sun, which can stiffen natural cotton fibers and fade colors.",
          "Avoid tumble drying on high heat; high heat causes shrinkage and weakens structural seams.",
        ],
      },
      {
        title: "Ironing & Steaming",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        details: [
          "Iron on medium-warm heat (cotton setting) while the fabric is slightly damp for smooth results.",
          "Steam pressing is highly recommended—it relaxes cotton fibers naturally without crushing weave.",
          "Always iron printed sections inside-out to protect decorative details.",
        ],
      },
      {
        title: "Storage & Preservation",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        details: [
          "Store in a dry, well-ventilated wardrobe away from humidity and dampness.",
          "Hang structured silhouettes on rounded wooden or padded hangers to maintain shoulder form.",
          "Fold skirts or casual cuts neatly with cedar balls or natural lavender sachets to deter moths.",
        ],
      },
    ],
    dos: [
      "Wash inside out in cold water",
      "Air dry flat or hung in shade",
      "Iron while slightly damp or use steam",
      "Use mild, eco-conscious liquid detergent",
    ],
    donts: [
      "Never use chlorine bleach or brighteners",
      "Do not tumble dry on high heat",
      "Avoid wringing or harsh twisting",
      "Do not dry under direct harsh sunlight",
    ],
  },
  silk: {
    id: "silk",
    name: "Blended Silk",
    description:
      "Our blended silks unite the incomparable drape and luminous glow of silk with the breathability of fine natural fibers. These pieces demand delicate handling to protect their luxurious weave and subtle luster.",
    symbols: [
      { label: "Hand Wash", sublabel: "Cold Only", icon: LaundryIcons.washHand },
      { label: "Do Not Bleach", sublabel: "No Chlorine", icon: LaundryIcons.doNotBleach },
      { label: "Dry Flat", sublabel: "In Shade", icon: LaundryIcons.flatDryShade },
      { label: "Low Iron", sublabel: "Silk Setting", icon: LaundryIcons.ironLow },
      { label: "Dry Clean", sublabel: "Recommended", icon: LaundryIcons.dryCleanP },
    ],
    sections: [
      {
        title: "Washing & Cleansing",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
        details: [
          "Professional dry cleaning is strongly recommended to preserve the original finish and silhouette.",
          "If hand washing at home, submerge gently in cold water using a specialized silk/delicate wash.",
          "Never soak for longer than 3–5 minutes. Gently swirl without rubbing or friction.",
          "Never use standard powdered detergents, stain removers, or bleaching agents.",
        ],
      },
      {
        title: "Drying & Moisture",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        details: [
          "Do not wring, twist, or spin dry. Roll the garment inside a clean, dry white towel to gently extract moisture.",
          "Lay flat on a drying rack over a towel in the shade, away from direct sunlight and radiators.",
          "Never tumble dry under any circumstance—heat damages delicate silk protein fibers.",
        ],
      },
      {
        title: "Ironing & Steaming",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        details: [
          "Iron on the reverse side on the lowest 'Silk' setting while the garment is slightly damp.",
          "Always place a clean cotton pressing cloth between the iron and silk surface.",
          "Handheld garment steaming is ideal: keep the nozzle at least 8–10 cm away to prevent water spots.",
        ],
      },
      {
        title: "Storage & Preservation",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        details: [
          "Store on soft, padded hangers in breathable cotton garment bags (avoid plastic covers).",
          "Keep away from direct UV exposure to maintain dye brilliance and prevent fabric brittleness.",
          "Allow perfumes, lotions, and deodorants to dry completely before slipping into your silk garment.",
        ],
      },
    ],
    dos: [
      "Dry clean or cold hand wash with silk detergent",
      "Roll in a towel to extract water—never wring",
      "Steam or iron reverse side on low with press cloth",
      "Store in breathable cotton covers away from sunlight",
    ],
    donts: [
      "Never tumble dry or expose to heat sources",
      "Never spray perfume or deodorants directly on silk",
      "Do not wring, scrub or twist the delicate blend",
      "Avoid spot-cleaning with water (causes rings)",
    ],
  },
  batik: {
    id: "batik",
    name: "Batik",
    description:
      "Every CHARINI batik creation is a testament to heritage craftsmanship, individually wax-resisted and hand-dyed by master artisans in Sri Lanka. The slight nuances and natural variations are signatures of authentic handmade art.",
    symbols: [
      { label: "Hand Wash", sublabel: "Cold Separately", icon: LaundryIcons.washHand },
      { label: "Do Not Bleach", sublabel: "No Chemicals", icon: LaundryIcons.doNotBleach },
      { label: "Dry in Shade", sublabel: "Inside-Out", icon: LaundryIcons.lineDryShade },
      { label: "Medium Iron", sublabel: "On Reverse", icon: LaundryIcons.ironMedium },
      { label: "No Tumble Dry", sublabel: "Air Dry Only", icon: LaundryIcons.noTumble },
    ],
    sections: [
      {
        title: "Washing & Cleansing",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
        details: [
          "Always wash separately by hand in cold water for initial washes. Artisan dyes may release slight surface tint.",
          "Use a gentle, natural soap or mild baby shampoo. Avoid commercial enzyme detergents or brighteners.",
          "Do not soak for extended periods—rinse swiftly and gently in fresh, cool water.",
          "Never machine wash on aggressive cycles or together with coarse garments like denim.",
        ],
      },
      {
        title: "Drying & Moisture",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        details: [
          "Dry inside-out in a cool, shaded area with gentle air circulation.",
          "Never dry under intense direct sunlight, which gradually fades handcrafted artisan pigments.",
          "Gently press out excess water without harsh twisting, then hang or lay flat to dry naturally.",
          "Do not tumble dry.",
        ],
      },
      {
        title: "Ironing & Steaming",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        details: [
          "Always iron on the reverse (inside) of the fabric on medium heat.",
          "If pressing on the face side, place a clean cotton pressing cloth over the batik artwork.",
          "Steaming is wonderful for relaxing the weave while keeping the wax-resist artwork smooth and rich.",
        ],
      },
      {
        title: "Storage & Preservation",
        icon: (
          <svg className="w-4 h-4 text-charini-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        details: [
          "Store in a cool, dry place shielded from prolonged sunlight and bright showroom lights.",
          "Fold carefully or hang on sturdy wooden hangers that support the shoulders evenly.",
          "Avoid direct contact with mothballs or synthetic chemical repellents; prefer natural sandalwood or cedar.",
        ],
      },
    ],
    dos: [
      "Hand wash cold separately for initial washes",
      "Dry inside-out strictly in the shade",
      "Iron on reverse side on medium heat",
      "Treat as a bespoke piece of artisan art",
    ],
    donts: [
      "Never expose to direct harsh midday sun",
      "Do not use bleach, optical brighteners or enzymes",
      "Do not soak in warm or hot water",
      "Never tumble dry in hot machines",
    ],
  },
};

export default function CareInstructionsClient() {
  const [activeFabric, setActiveFabric] = useState<FabricType>("cotton");
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();
  const backHref = queryString ? `/?${queryString}` : "/";

  // Check URL hash or query param on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "cotton" || hash === "silk" || hash === "batik") {
        setActiveFabric(hash as FabricType);
        return;
      }
      const param = searchParams?.get("fabric")?.toLowerCase();
      if (param === "cotton" || param === "silk" || param === "batik") {
        setActiveFabric(param as FabricType);
      }
    }
  }, [searchParams]);

  const handleSelectFabric = (id: FabricType) => {
    setActiveFabric(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const fabric = CARE_DATA[activeFabric];

  return (
    <div className="editorial-canvas min-h-screen flex flex-col justify-between py-6 sm:py-12 px-3.5 sm:px-6">
      <div className="w-full max-w-[580px] mx-auto flex flex-col items-center">
        {/* Sleek Mobile-First Top Bar */}
        <div className="w-full flex items-center justify-start mb-5 sm:mb-7">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-charini-border text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-charini-charcoal hover:bg-black/5 transition-colors group cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <span className="text-xs group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            <span>Return</span>
          </Link>
        </div>

        {/* Refined Brand Emblem Header */}
        <header className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="relative w-[56px] sm:w-[72px] aspect-[3256/4088] mb-3.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <Image
              src="/brand/charini-emblem.png"
              alt="CHARINI"
              fill
              priority
              sizes="(max-width: 640px) 56px, 72px"
              className="object-contain"
            />
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl text-charini-charcoal font-normal tracking-tight mb-2">
            Garment Care Guide
          </h1>
          <p className="font-sans text-[11.5px] sm:text-xs text-charini-charcoal-muted max-w-[380px] leading-relaxed px-2">
            Every CHARINI creation is handcrafted with mindful craftsmanship. Follow these curated instructions to preserve the beauty, touch, and longevity of your pieces.
          </p>
        </header>

        {/* Segmented Fabric Selection Pills */}
        <div className="w-full mb-5 sm:mb-7">
          <div className="text-center mb-2">
            <span className="font-sans text-[9.5px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-charini-charcoal-dim">
              Select Fabric
            </span>
          </div>

          {/* Touch-Friendly Segmented Control */}
          <div
            role="tablist"
            aria-label="Fabric Selection"
            className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#F4F1EA] rounded-full border border-charini-border shadow-inner"
          >
            {(
              [
                { id: "cotton", label: "100% Cotton" },
                { id: "silk", label: "Blended Silk" },
                { id: "batik", label: "Batik" },
              ] as const
            ).map((item) => {
              const isSelected = activeFabric === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => handleSelectFabric(item.id)}
                  className={`min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-2 rounded-full text-[11px] sm:text-xs font-sans tracking-wide transition-colors duration-150 cursor-pointer flex items-center justify-center text-center select-none touch-manipulation [font-variant-numeric:lining-nums] ${
                    isSelected
                      ? "bg-charini-charcoal text-white font-semibold shadow-md"
                      : "bg-transparent text-charini-charcoal-muted hover:text-charini-charcoal hover:bg-black/5 font-medium"
                  }`}
                >
                  <span className="pointer-events-none truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Fabric Editorial Content Card */}
        <main
          key={activeFabric}
          className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-charini-border shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-5 sm:gap-6 transition-all duration-200"
        >
          {/* Header of Active Fabric - Clean Stack */}
          <div className="border-b border-charini-border pb-4 sm:pb-5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-charini-charcoal inline-block" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-charini-charcoal-dim">
                Care Guide &bull; {fabric.name}
              </span>
            </div>

            {/* Title with lining numbers so 100% is not dropped */}
            <h2 className="font-serif text-2xl sm:text-3xl text-charini-charcoal font-normal tracking-tight [font-variant-numeric:lining-nums]">
              {fabric.name}
            </h2>

            <p className="font-sans text-[12px] sm:text-[13px] text-charini-charcoal-muted mt-2 leading-relaxed">
              {fabric.description}
            </p>
          </div>

          {/* Quick Care Reference (Clean Responsive Grid with Authentic SVG Symbols) */}
          <div className="bg-[#FAF9F7] rounded-2xl p-3 sm:p-4 border border-charini-border/70">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-[9.5px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase text-charini-charcoal-dim">
                Care Symbols
              </span>
              <span className="text-[10px] font-sans text-charini-charcoal-dim hidden sm:inline">
                ISO 3758 Standards
              </span>
            </div>

            {/* Horizontal Scroll on small phones, 5-col on tablets */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {fabric.symbols.map((sym, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl py-2 px-1 sm:px-2 border border-charini-border/60 flex flex-col items-center justify-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[64px]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FAF9F7] flex items-center justify-center mb-1">
                    {sym.icon}
                  </div>
                  <span className="font-sans text-[10px] font-medium text-charini-charcoal leading-tight line-clamp-1">
                    {sym.label}
                  </span>
                  <span className="font-sans text-[8.5px] text-charini-charcoal-muted leading-tight mt-0.5">
                    {sym.sublabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Instructions (Clean Mobile Touch Cards) */}
          <div className="space-y-3 sm:space-y-3.5">
            {fabric.sections.map((section, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-charini-border/70 bg-[#FAF9F7]/70"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-white border border-charini-border flex items-center justify-center shadow-xs shrink-0">
                    {section.icon}
                  </div>
                  <h3 className="font-sans text-[12px] sm:text-[13px] font-semibold text-charini-charcoal tracking-wide">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 pl-8 sm:pl-8">
                  {section.details.map((detail, dIdx) => (
                    <li
                      key={dIdx}
                      className="font-sans text-[11.5px] sm:text-xs text-charini-charcoal-muted leading-relaxed list-disc marker:text-charini-charcoal-dim/70"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Do's & Don'ts - Mobile Friendly Clean Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* The Do's */}
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-[#F6FAF7] border border-[#D5EADB]">
              <div className="flex items-center gap-1.5 mb-2 text-[#1E5D38]">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-sans text-[10.5px] font-semibold uppercase tracking-wider">
                  Always Do
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] sm:text-xs text-[#2A5E3E]">
                {fabric.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#1E5D38] font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Don'ts */}
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-[#FFF6F6] border border-[#FAD7D7]">
              <div className="flex items-center gap-1.5 mb-2 text-[#A32D2D]">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-sans text-[10.5px] font-semibold uppercase tracking-wider">
                  Please Avoid
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] sm:text-xs text-[#8A2424]">
                {fabric.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#A32D2D] font-bold">&times;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Return Button */}
          <div className="pt-3 border-t border-charini-border flex justify-center">
            <Link
              href={backHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-charini-charcoal hover:bg-[#333336] active:scale-[0.99] text-white font-sans text-xs font-medium tracking-wide transition-all cursor-pointer shadow-xs"
            >
              <span>Return to Signup</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </main>
      </div>

      {/* Editorial Footer */}
      <footer className="text-center mt-8 sm:mt-12">
        <p className="font-sans text-[9.5px] sm:text-[10px] tracking-[0.2em] uppercase text-charini-charcoal-dim/60 font-light">
          CHARINI &bull; Wearable Expressions of Art &bull; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
