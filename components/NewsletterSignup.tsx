"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { InterestTag, SubscribeResponse } from "@/lib/subscriptions/contract";
import { ERROR_MESSAGES } from "@/lib/subscriptions/contract";
import {
  SPECIFIC_CUTS_SLUG,
  STORE_SLUGS,
  CUT_TYPE_SLUGS,
  CUT_TYPE_OPTIONS,
} from "@/lib/config";

interface NewsletterSignupProps {
  initialTags: InterestTag[];
}

export default function NewsletterSignup({ initialTags }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [specificCutsNote, setSpecificCutsNote] = useState("");
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  const renderTimeRef = useRef<number>(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const specificCutsInputRef = useRef<HTMLInputElement>(null);
  const storeSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderTimeRef.current = Date.now();
  }, []);

  // 1. Store tags (CHARINI, CHARINI STORIES)
  const storeTags = initialTags.filter((tag) =>
    (STORE_SLUGS as readonly string[]).includes(tag.slug),
  );

  // 2. Cut type tags (Versatile Skirts, Wrap Around Skirts, Shirt Dresses, Fit and Flare, Shirts)
  const cutTypeTagsFromProps = initialTags.filter((tag) =>
    (CUT_TYPE_SLUGS as readonly string[]).includes(tag.slug as any),
  );
  const availableCutTypeTags: InterestTag[] =
    cutTypeTagsFromProps.length > 0
      ? cutTypeTagsFromProps
      : (CUT_TYPE_OPTIONS as unknown as InterestTag[]);

  // 3. Main updates tags (New Prints, New Cuts, Collections, Special Releases, Specific Cuts)
  const updateTags = initialTags.filter(
    (tag) =>
      !(STORE_SLUGS as readonly string[]).includes(tag.slug) &&
      !(CUT_TYPE_SLUGS as readonly string[]).includes(tag.slug as any),
  );

  // Fallback if tags from DB are missing store slugs
  const availableStoreTags =
    storeTags.length > 0
      ? storeTags
      : [
          { slug: "charini", label: "CHARINI" },
          { slug: "charini-stories", label: "CHARINI STORIES" },
        ];

  const selectedStores = selectedInterests.filter((s) =>
    (STORE_SLUGS as readonly string[]).includes(s),
  );
  const hasStoreSelected = selectedStores.length > 0;
  const isStoriesSelected = selectedInterests.includes("charini-stories");
  const isSpecificCutsSelected = selectedInterests.includes(SPECIFIC_CUTS_SLUG);

  // Cut type tags appear when STORIES (or both stores) AND Specific Cuts are selected
  const showCutTypeTags = isStoriesSelected && isSpecificCutsSelected;

  const toggleInterest = (slug: string) => {
    setSelectedInterests((prev) => {
      const isSelected = prev.includes(slug);
      if (isSelected) {
        if (slug === SPECIFIC_CUTS_SLUG) {
          setSpecificCutsNote("");
          // When Specific Cuts is deselected, also deselect any cut type tags
          return prev.filter(
            (s) => s !== slug && !(CUT_TYPE_SLUGS as readonly string[]).includes(s as any),
          );
        }
        if (slug === "charini-stories") {
          // If STORIES is deselected and only CHARINI remains, remove cut type tags
          return prev.filter(
            (s) => s !== slug && !(CUT_TYPE_SLUGS as readonly string[]).includes(s as any),
          );
        }
        return prev.filter((s) => s !== slug);
      } else {
        return [...prev, slug];
      }
    });

    if (errorField === "interests" || errorField === "stores") {
      setErrorMessage(null);
      setErrorField(null);
    }
  };

  const handleUpdateTagClick = (slug: string) => {
    if (!hasStoreSelected) {
      setErrorMessage("Please select a store (CHARINI or CHARINI STORIES) first.");
      setErrorField("stores");
      storeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    toggleInterest(slug);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorField(null);

    const trimmedEmail = email.trim();

    // 1. Validate email presence
    if (!trimmedEmail) {
      setErrorMessage(ERROR_MESSAGES.email_required);
      setErrorField("email");
      emailInputRef.current?.focus();
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage(ERROR_MESSAGES.invalid_email);
      setErrorField("email");
      emailInputRef.current?.focus();
      return;
    }

    // 3. Validate at least one store selected
    if (!hasStoreSelected) {
      setErrorMessage(ERROR_MESSAGES.store_required);
      setErrorField("stores");
      storeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 4. Validate marketing consent
    if (!consent) {
      setErrorMessage(ERROR_MESSAGES.consent_required);
      setErrorField("consent");
      return;
    }

    setIsSubmitting(true);

    try {
      const elapsedMs = renderTimeRef.current > 0 ? Date.now() - renderTimeRef.current : 2000;

      // If cut type tags were selected, combine them into specificCutsNote for immediate clarity
      const selectedCutLabels = availableCutTypeTags
        .filter((tag) => selectedInterests.includes(tag.slug))
        .map((tag) => tag.label);

      let finalNote: string | null = null;
      if (isSpecificCutsSelected) {
        const userTypedNote = specificCutsNote.trim();
        if (selectedCutLabels.length > 0 && userTypedNote) {
          finalNote = `${selectedCutLabels.join(", ")} — ${userTypedNote}`;
        } else if (selectedCutLabels.length > 0) {
          finalNote = selectedCutLabels.join(", ");
        } else if (userTypedNote) {
          finalNote = userTypedNote;
        }
      }

      const payload = {
        email: trimmedEmail,
        interests: selectedInterests,
        specificCutsNote: finalNote,
        marketingConsent: consent,
        elapsedMs,
      };

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as SubscribeResponse;

      if (!res.ok || !data.ok) {
        if (!data.ok && data.code) {
          const message = ERROR_MESSAGES[data.code] || ERROR_MESSAGES.invalid_request;
          setErrorMessage(message);
          setErrorField(data.field || null);
          if (data.field === "email") {
            emailInputRef.current?.focus();
          } else if (data.field === "stores") {
            storeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          setErrorMessage(ERROR_MESSAGES.server_error);
        }
        return;
      }

      // Success verified by database
      setIsSuccess(true);
    } catch {
      setErrorMessage(ERROR_MESSAGES.network);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto px-5 py-10 sm:py-16 flex flex-col items-center">
      {/* Brand Logo Header using Charini Logo new.png */}
      <header className="mb-8 sm:mb-10 flex flex-col items-center">
        <div className="relative w-[110px] sm:w-[124px] aspect-[3256/4088]">
          <Image
            src="/charinilogo.png"
            alt="CHARINI"
            fill
            priority
            sizes="(max-width: 640px) 110px, 124px"
            className="object-contain"
          />
        </div>
      </header>

      {/* Main Content Area */}
      {isSuccess ? (
        <section
          aria-live="polite"
          className="w-full py-14 sm:py-20 text-center animate-fade-in flex flex-col items-center"
        >
          <p className="font-serif text-2xl sm:text-3xl text-charini-charcoal font-normal tracking-tight">
            Thank you for subscribing.
          </p>
        </section>
      ) : (
        <main className="w-full">
          {/* Exact Headings */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-[38px] text-charini-charcoal font-normal tracking-tight leading-tight mb-3.5">
              Stay in the loop.
            </h1>
            <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[360px] mx-auto font-normal">
              Be the first to hear about new prints, new cuts, collections and special releases.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-6">
            {/* Email Field */}
            <div className="w-full flex flex-col">
              <label
                htmlFor="email"
                className="font-sans text-[11px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-2"
              >
                Email
              </label>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorField === "email") {
                    setErrorMessage(null);
                    setErrorField(null);
                  }
                }}
                placeholder="Enter your email address"
                aria-required="true"
                aria-invalid={errorField === "email" ? "true" : undefined}
                aria-describedby={errorMessage && errorField === "email" ? "form-error" : undefined}
                className={`w-full min-h-[48px] px-4 py-3 bg-white text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border ${
                  errorField === "email"
                    ? "border-charini-error focus:border-charini-error"
                    : "border-charini-border focus:border-charini-charcoal"
                } transition-colors duration-150 rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}
              />
            </div>

            {/* Step 1: Store Selection */}
            <div ref={storeSectionRef} className="w-full flex flex-col">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-sans text-[11px] font-medium tracking-[0.14em] uppercase text-charini-charcoal">
                  1. Select Store
                </span>
                <span className="font-sans text-[11px] text-charini-charcoal-dim">
                  Select one or both
                </span>
              </div>
              <p className="font-sans text-[11px] text-charini-charcoal-muted mb-2.5">
                Choose which store you would like to hear from:
              </p>

              <fieldset
                aria-describedby={
                  errorMessage && errorField === "stores" ? "form-error" : undefined
                }
                className="border-none p-0 m-0"
              >
                <legend className="sr-only">Select Store</legend>
                <div className="flex flex-wrap gap-2">
                  {availableStoreTags.map((tag) => {
                    const isSelected = selectedInterests.includes(tag.slug);
                    return (
                      <label
                        key={tag.slug}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] text-xs sm:text-[13px] tracking-wide rounded-full border cursor-pointer select-none transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "bg-charini-charcoal text-white border-charini-charcoal font-medium shadow-sm"
                            : errorField === "stores"
                            ? "bg-white text-charini-charcoal border-charini-error/60 hover:bg-[#FAF9F7]"
                            : "bg-white text-charini-charcoal border-charini-border hover:border-charini-charcoal-muted/70 hover:bg-[#FAF9F7]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => toggleInterest(tag.slug)}
                          aria-label={tag.label}
                        />
                        {/* Visual non-color indicator */}
                        {isSelected && (
                          <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full bg-white inline-block"
                          />
                        )}
                        <span>{tag.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {/* Step 2: Update Preferences (unlocked after store selection) */}
            <div className="w-full flex flex-col">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-sans text-[11px] font-medium tracking-[0.14em] uppercase text-charini-charcoal">
                  2. Choose Your Updates
                </span>
                {!hasStoreSelected && (
                  <span className="font-sans text-[10px] sm:text-[11px] text-charini-charcoal-dim uppercase tracking-wider">
                    Select store first
                  </span>
                )}
              </div>
              <p className="font-sans text-[11px] text-charini-charcoal-muted mb-2.5">
                {hasStoreSelected
                  ? "Select the updates you would like to receive (optional):"
                  : "Please select a store above to unlock update options."}
              </p>

              <fieldset
                aria-disabled={!hasStoreSelected}
                className={`border-none p-0 m-0 transition-all duration-200 ${
                  !hasStoreSelected
                    ? "opacity-35 pointer-events-none select-none grayscale-[30%]"
                    : "opacity-100"
                }`}
              >
                <legend className="sr-only">Choose Your Updates</legend>
                <div className="flex flex-wrap gap-2">
                  {updateTags.map((tag) => {
                    const isSelected = selectedInterests.includes(tag.slug);
                    return (
                      <label
                        key={tag.slug}
                        onClick={(e) => {
                          if (!hasStoreSelected) {
                            e.preventDefault();
                            handleUpdateTagClick(tag.slug);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs sm:text-[13px] tracking-wide rounded-full border cursor-pointer select-none transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "bg-charini-charcoal text-white border-charini-charcoal font-medium shadow-sm"
                            : "bg-white text-charini-charcoal border-charini-border hover:border-charini-charcoal-muted/70 hover:bg-[#FAF9F7]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          tabIndex={!hasStoreSelected ? -1 : 0}
                          disabled={!hasStoreSelected}
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => handleUpdateTagClick(tag.slug)}
                          aria-label={tag.label}
                        />
                        {/* Visual non-color indicator */}
                        {isSelected && (
                          <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full bg-white inline-block"
                          />
                        )}
                        <span>{tag.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Conditional Specific Cuts Area */}
              <div
                className="conditional-field mt-3 flex flex-col gap-3"
                hidden={!isSpecificCutsSelected || !hasStoreSelected}
                aria-hidden={!isSpecificCutsSelected || !hasStoreSelected}
              >
                {/* When STORIES (or both stores) + Specific Cuts are selected, show cut type tags */}
                {showCutTypeTags && (
                  <div className="flex flex-col gap-2 pt-1 pb-1 animate-fade-in bg-[#FAF9F7] p-3 border border-charini-border/70">
                    <div className="flex items-baseline justify-between">
                      <span className="font-sans text-[10px] font-semibold tracking-[0.14em] uppercase text-charini-charcoal">
                        Cut Types:
                      </span>
                      <span className="font-sans text-[10px] text-charini-charcoal-dim">
                        STORIES Cuts
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableCutTypeTags.map((tag) => {
                        const isSelected = selectedInterests.includes(tag.slug);
                        return (
                          <label
                            key={tag.slug}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs tracking-wide rounded-full border cursor-pointer select-none transition-all duration-150 active:scale-[0.98] ${
                              isSelected
                                ? "bg-charini-charcoal text-white border-charini-charcoal font-medium shadow-xs"
                                : "bg-white text-charini-charcoal border-charini-border hover:border-charini-charcoal-muted/70 hover:bg-[#FAF9F7]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isSelected}
                              onChange={() => toggleInterest(tag.slug)}
                              aria-label={tag.label}
                            />
                            {isSelected && (
                              <span
                                aria-hidden="true"
                                className="w-1.5 h-1.5 rounded-full bg-white inline-block"
                              />
                            )}
                            <span>{tag.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Cut Notes input */}
                <div>
                  <label htmlFor="specific-cuts-note" className="sr-only">
                    Specific cuts preferences
                  </label>
                  <input
                    ref={specificCutsInputRef}
                    id="specific-cuts-note"
                    type="text"
                    maxLength={500}
                    value={specificCutsNote}
                    onChange={(e) => setSpecificCutsNote(e.target.value)}
                    placeholder={
                      showCutTypeTags
                        ? "Any other specific cuts or requests (optional)"
                        : "Tell us which cuts you're interested in"
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 bg-charini-surface text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal transition-colors duration-150 rounded-none"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Consent Checkbox */}
            <div className="w-full flex items-start gap-3 pt-1">
              <input
                id="marketing-consent"
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (errorField === "consent") {
                    setErrorMessage(null);
                    setErrorField(null);
                  }
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-charini-border text-charini-charcoal accent-charini-charcoal cursor-pointer"
              />
              <label
                htmlFor="marketing-consent"
                className="font-sans text-[11px] sm:text-xs text-charini-charcoal-muted leading-relaxed cursor-pointer select-none"
              >
                I agree to receive marketing communications from CHARINI about the updates I have
                selected.
              </label>
            </div>

            {/* Error Message Announcement */}
            {errorMessage && (
              <div
                id="form-error"
                role="alert"
                aria-live="polite"
                className="w-full py-2.5 px-3.5 bg-charini-error-bg border border-charini-error/30 text-charini-error text-xs text-center"
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button (Long button, greyed out until checkbox is agreed to) */}
            <button
              type="submit"
              disabled={!consent || isSubmitting}
              aria-disabled={!consent || isSubmitting}
              className={`w-full min-h-[52px] py-4 px-6 font-sans text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                !consent || isSubmitting
                  ? "bg-[#E6E2DC] text-[#9C958D] border border-[#DDD8D0] cursor-not-allowed shadow-none"
                  : "bg-charini-charcoal hover:bg-charini-charcoal-deep text-white border border-charini-charcoal cursor-pointer shadow-[0_2px_8px_rgba(26,25,24,0.12)] active:scale-[0.99]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"
                  />
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>
        </main>
      )}
    </div>
  );
}
