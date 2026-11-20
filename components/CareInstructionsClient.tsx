"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FabricType = "cotton" | "silk" | "batik";

interface CareSection {
  title: string;
  icon: React.ReactNode;
  details: string[];
}

interface FabricCareData {
  id: FabricType;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  symbols: { label: string; icon: string }[];
  sections: CareSection[];
  dos: string[];
  donts: string[];
}

const CARE_DATA: Record<FabricType, FabricCareData> = {
  cotton: {
    id: "cotton",
    name: "100% Cotton",
    subtitle: "Pure Natural Weaves & Designer Prints",
    badge: "Breathable & Enduring",
    description:
      "Crafted from 100% natural cotton fibers, our pieces are designed for effortless comfort and breathability in tropical and warm climates. Natural cotton softens gracefully with each wash when treated with gentle care.",
    symbols: [
      { label: "Cold Wash 30°C", icon: "30°" },
      { label: "Do Not Bleach", icon: "△" },
      { label: "Line Dry in Shade", icon: "⌂" },
      { label: "Warm Iron", icon: "••" },
      { label: "Dry Cleanable", icon: "Ⓟ" },
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
          "Hand wash or use a gentle, low-spin machine cycle in cold or lukewarm water (maximum 30°C / 85°F).",
          "Use a gentle, pH-neutral liquid detergent formulated for fine natural textiles.",
          "Wash like colors together. Turn printed garments inside out before washing to safeguard artistic pigments.",
          "Avoid heavy chemical detergents, fabric softeners with brighteners, or chlorine bleach.",
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
          "Gently reshape the garment while still damp and line-dry naturally in a shaded, well-ventilated breeze.",
          "Avoid direct midday sun, which can cause natural cotton fibers to stiffen and colors to fade.",
          "Do not tumble dry on high heat; intense machine heat causes fiber shrinkage and weakens seams.",
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
          "Iron on medium-warm heat (cotton setting) while the fabric is still slightly damp for crisp, smooth results.",
          "Steam pressing is highly recommended—it relaxes cotton fibers naturally without crushing the weave.",
          "Always iron printed sections inside-out to protect decorative detailing.",
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
          "Hang shirt dresses and structured silhouettes on rounded wooden or padded hangers to maintain shoulder form.",
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
    subtitle: "Fluid Drapes, Delicate Sheen & Artisan Blends",
    badge: "Delicate & Luxurious",
    description:
      "Our blended silks unite the incomparable drape and luminous glow of silk with the breathability of fine natural fibers. These pieces demand delicate handling to protect their luxurious weave and subtle luster.",
    symbols: [
      { label: "Hand Wash Cold", icon: "🖐" },
      { label: "Do Not Bleach", icon: "△" },
      { label: "Dry Flat in Shade", icon: "▭" },
      { label: "Low Iron / Silk", icon: "•" },
      { label: "Dry Clean Recommended", icon: "Ⓟ" },
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
          "Professional dry cleaning is strongly recommended to preserve the original finish and structural silhouette.",
          "If hand washing at home, submerge gently in cold water using a specialized silk or wool wash (pH-neutral).",
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
          "Do not wring, twist, or spin dry. Roll the garment inside a clean, dry white towel and gently press to extract moisture.",
          "Lay flat on a drying rack over a towel in the shade, away from direct sunlight and radiators.",
          "Never tumble dry under any circumstance—heat damages silk protein fibers instantly.",
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
          "Always use a clean press cloth (like a thin cotton handkerchief) between the iron and silk surface.",
          "Handheld garment steaming is ideal: keep the steamer nozzle at least 8–10 cm away to prevent water spotting.",
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
    subtitle: "Artisan Hand-Dyed Heritage & Wax-Resist Craft",
    badge: "Wearable Handcrafted Art",
    description:
      "Every CHARINI batik creation is a testament to heritage craftsmanship, individually wax-resisted and hand-dyed by master artisans in Sri Lanka. The slight nuances and natural variations are signatures of authentic handmade art.",
    symbols: [
      { label: "Hand Wash Cold Separately", icon: "🖐" },
      { label: "Mild / Natural Soap", icon: "🌱" },
      { label: "Dry in Shade", icon: "⌂" },
      { label: "Medium Iron on Reverse", icon: "••" },
      { label: "No Harsh Chemicals", icon: "✕" },
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
          "Always wash separately by hand in cold water for the first few washes. Natural artisan dyes may release excess surface tint without affecting depth.",
          "Use a gentle, natural soap or mild baby shampoo. Avoid commercial enzyme detergents or brighteners.",
          "Do not soak for extended periods—rinse swiftly and gently in fresh, cool water.",
          "Never machine wash on aggressive cycles or with heavy fabrics like denim.",
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
          "Dry inside-out in a cool, shaded area with plenty of air circulation.",
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
          "If you must iron the face side, place a thin cotton pressing cloth over the batik artwork.",
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
          "Store in a cool, dry place shielded from prolonged sunlight and fluorescent store lights.",
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

  const fabric = CARE_DATA[activeFabric];

  return (
    <div className="editorial-canvas min-h-screen flex flex-col justify-between py-10 sm:py-16 px-4 sm:px-6">
      <div className="w-full max-w-[620px] mx-auto flex flex-col items-center">
        {/* Top Return Link */}
        <div className="w-full flex items-center justify-between mb-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-sans font-medium uppercase tracking-[0.16em] text-charini-charcoal-muted hover:text-charini-charcoal transition-colors group cursor-pointer"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            <span>Return to Signup</span>
          </Link>
          <span className="font-serif italic text-xs text-charini-charcoal-dim">
            Artisan Wearable Art
          </span>
        </div>

        {/* Brand Emblem */}
        <header className="flex flex-col items-center text-center mb-7">
          <div className="relative w-[80px] sm:w-[95px] aspect-[3256/4088] mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <Image
              src="/brand/charini-emblem.png"
              alt="CHARINI"
              fill
              priority
              sizes="(max-width: 640px) 80px, 95px"
              className="object-contain"
            />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charini-charcoal font-normal tracking-tight mb-2">
            Garment Care Guide
          </h1>
          <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted max-w-[420px] leading-relaxed">
            Every CHARINI creation is handcrafted with mindful craftsmanship. Follow these curated instructions to preserve the beauty, touch, and longevity of your pieces.
          </p>
        </header>

        {/* Fabric Selection Pills */}
        <div className="w-full mb-7">
          <div className="text-center mb-2.5">
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-charini-charcoal-dim">
              Select Fabric
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-1 bg-white/80 backdrop-blur-xs rounded-full border border-charini-border shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
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
                  type="button"
                  onClick={() => setActiveFabric(item.id)}
                  className={`min-h-[40px] px-2 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-charini-charcoal text-white shadow-xs"
                      : "text-charini-charcoal-muted hover:text-charini-charcoal hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Fabric Content Card */}
        <main className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-charini-border shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-6 animate-fade-in">
          {/* Header of Active Fabric */}
          <div className="border-b border-charini-border pb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-charini-charcoal/5 text-charini-charcoal">
                {fabric.badge}
              </span>
              <span className="text-[11px] font-serif italic text-charini-charcoal-muted">
                {fabric.subtitle}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-charini-charcoal font-medium">
              {fabric.name}
            </h2>
            <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted mt-2 leading-relaxed">
              {fabric.description}
            </p>
          </div>

          {/* Quick Care Symbols Bar */}
          <div className="bg-[#FAF9F7] rounded-2xl p-4 border border-charini-border/80">
            <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-charini-charcoal-dim mb-3 text-center sm:text-left">
              Quick Care Reference
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              {fabric.symbols.map((sym, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl py-2.5 px-2 border border-charini-border/60 flex flex-col items-center justify-center gap-1"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FAF9F7] border border-charini-border/80 flex items-center justify-center text-xs font-semibold text-charini-charcoal">
                    {sym.icon}
                  </span>
                  <span className="font-sans text-[10px] text-charini-charcoal-muted leading-tight">
                    {sym.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Instructions Grid */}
          <div className="space-y-4">
            {fabric.sections.map((section, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border border-charini-border/80 bg-[#FAF9F7]/60 hover:bg-[#FAF9F7] transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-charini-border flex items-center justify-center shadow-xs shrink-0">
                    {section.icon}
                  </div>
                  <h3 className="font-sans text-xs sm:text-sm font-semibold text-charini-charcoal tracking-wide">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 pl-9">
                  {section.details.map((detail, dIdx) => (
                    <li
                      key={dIdx}
                      className="font-sans text-xs text-charini-charcoal-muted leading-relaxed list-disc marker:text-charini-charcoal-dim"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Dos & Don'ts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* The Do's */}
            <div className="p-4 rounded-2xl bg-[#F6FAF7] border border-[#D1E7D8]">
              <div className="flex items-center gap-2 mb-2.5 text-[#1E5D38]">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-sans text-xs font-semibold uppercase tracking-wider">
                  Always Do
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#2A5E3E]">
                {fabric.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#1E5D38] font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Don'ts */}
            <div className="p-4 rounded-2xl bg-[#FFF6F6] border border-[#FAD7D7]">
              <div className="flex items-center gap-2 mb-2.5 text-[#A32D2D]">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-sans text-xs font-semibold uppercase tracking-wider">
                  Avoid
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#8A2424]">
                {fabric.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#A32D2D] font-bold">&times;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-4 border-t border-charini-border flex justify-center">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-charini-charcoal hover:bg-[#333336] text-white font-sans text-xs font-medium tracking-wide transition-colors cursor-pointer"
            >
              <span>Return to Signup</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-charini-charcoal-dim/60 font-light">
          CHARINI &bull; Wearable Expressions of Art &bull; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
