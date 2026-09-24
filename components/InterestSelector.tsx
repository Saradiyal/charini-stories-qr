"use client";

import { Check } from "lucide-react";
import { NewsletterPreference } from "@/lib/types";
import { NEWSLETTER_PREFERENCES } from "@/lib/config/constants";

interface InterestSelectorProps {
  selected: NewsletterPreference[];
  onChange: (updated: NewsletterPreference[]) => void;
  disabled?: boolean;
}

export default function InterestSelector({
  selected,
  onChange,
  disabled = false,
}: InterestSelectorProps) {
  const toggleInterest = (id: NewsletterPreference) => {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    id: NewsletterPreference
  ) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleInterest(id);
    }
  };

  return (
    <div className="w-full">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5"
        role="group"
        aria-label="Types of updates to receive"
      >
        {NEWSLETTER_PREFERENCES.map((pref) => {
          const isChecked = selected.includes(pref.id);

          return (
            <div
              key={pref.id}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={disabled ? -1 : 0}
              onClick={() => toggleInterest(pref.id)}
              onKeyDown={(e) => handleKeyDown(e, pref.id)}
              className={`relative flex items-center justify-between px-3.5 py-3 sm:py-3.5 rounded-sm cursor-pointer select-none transition-all duration-200 min-h-[46px] border ${
                isChecked
                  ? "bg-brand-green border-brand-green text-brand-neutral-bg shadow-[0_2px_8px_rgba(3,52,49,0.18)]"
                  : "bg-brand-white hover:bg-brand-cream border-brand-green/18 hover:border-brand-green/40 text-brand-dark"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span className="text-[12.5px] sm:text-[13px] font-sans tracking-wide font-medium">
                {pref.label}
              </span>

              {/* Clear Visual Check indicator */}
              <div
                className={`flex items-center justify-center w-4 h-4 rounded-sm border transition-colors duration-200 ml-2 shrink-0 ${
                  isChecked
                    ? "bg-brand-neutral-bg border-brand-neutral-bg text-brand-green"
                    : "border-brand-green/35 bg-transparent"
                }`}
              >
                {isChecked && <Check className="w-3 h-3 stroke-[2.8]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
