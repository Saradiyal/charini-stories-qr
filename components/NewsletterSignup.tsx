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
import { TOP_COUNTRIES, ALL_COUNTRIES } from "@/lib/countries";

interface NewsletterSignupProps {
  initialTags: InterestTag[];
}

export default function NewsletterSignup({ initialTags }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [specificCutsNote, setSpecificCutsNote] = useState("");
  const [consent, setConsent] = useState(false);

  // Profile details state (Thank You page)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91"); // Default to India (+91)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

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

  const handlePhoneChange = (val: string) => {
    // If user pastes/types with +, detect matching country code
    if (val.startsWith("+")) {
      const match = ALL_COUNTRIES.find((c) => val.startsWith(c.dialCode));
      if (match) {
        setPhoneCountryCode(match.dialCode);
        const remainder = val.slice(match.dialCode.length).trim().replace(/[^\d\s-]/g, "");
        setPhoneNumber(remainder);
        return;
      }
    }
    // Auto-strip leading 0 if Indian number (+91)
    let clean = val.replace(/[^\d\s-]/g, "");
    if (phoneCountryCode === "+91" && clean.startsWith("0")) {
      clean = clean.replace(/^0+/, "");
    }
    setPhoneNumber(clean);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // If all profile fields are empty, mark complete
    if (!firstName.trim() && !lastName.trim() && !phoneNumber.trim()) {
      setIsProfileSaved(true);
      return;
    }

    setIsSubmittingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/subscriber/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneCountryCode,
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setIsProfileSaved(true);
      } else {
        setProfileMessage("Unable to save details right now. Your subscription is active!");
      }
    } catch {
      setProfileMessage("Unable to save details right now. Your subscription is active!");
    } finally {
      setIsSubmittingProfile(false);
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
          className="w-full text-center animate-fade-in flex flex-col items-center"
        >
          {isProfileSaved ? (
            <div className="py-12 sm:py-16 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-charini-charcoal text-white flex items-center justify-center mb-5 shadow-sm">
                <svg
                  className="w-5 h-5 stroke-white"
                  viewBox="0 0 12 12"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                </svg>
              </div>
              <p className="font-serif text-2xl sm:text-3xl text-charini-charcoal font-normal tracking-tight mb-2">
                You&apos;re all set.
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[320px]">
                Thank you for subscribing. We look forward to welcoming you at the CHARINI pop-up!
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-7">
                <p className="font-serif text-2xl sm:text-3xl text-charini-charcoal font-normal tracking-tight mb-2">
                  Thank you for subscribing.
                </p>
                <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[360px] mx-auto font-normal">
                  Complete your profile for private invitations &amp; personal styling updates (optional).
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} noValidate className="w-full flex flex-col gap-4 text-left">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label
                      htmlFor="first-name"
                      className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1.5"
                    >
                      First Name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      maxLength={100}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full min-h-[46px] px-4 py-2.5 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="last-name"
                      className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1.5"
                    >
                      Last Name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      maxLength={100}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full min-h-[46px] px-4 py-2.5 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                {/* Contact Number with Country Code */}
                <div className="flex flex-col">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label
                      htmlFor="phone-number"
                      className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal"
                    >
                      Contact Number
                    </label>
                    <span className="font-sans text-[10px] text-charini-charcoal-dim">
                      WhatsApp updates
                    </span>
                  </div>

                  {/* Unified Curved Input Container */}
                  <div className="flex items-center w-full min-h-[48px] bg-white border border-charini-border focus-within:border-charini-charcoal transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-2">
                    {/* Country Code Selector */}
                    <div className="relative flex items-center shrink-0 pl-2 pr-1">
                      <select
                        id="country-code"
                        aria-label="Country dial code"
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="bg-transparent text-xs sm:text-sm text-charini-charcoal font-medium cursor-pointer pr-4 appearance-none focus:outline-none"
                      >
                        <optgroup label="Popular">
                          {TOP_COUNTRIES.map((c) => (
                            <option key={`top-${c.code}`} value={c.dialCode}>
                              {c.flag} {c.dialCode} ({c.name})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="All Countries">
                          {ALL_COUNTRIES.map((c) => (
                            <option key={`all-${c.code}`} value={c.dialCode}>
                              {c.flag} {c.dialCode} - {c.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <svg
                        className="w-3 h-3 text-charini-charcoal-dim pointer-events-none absolute right-0.5"
                        viewBox="0 0 10 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 1L5 5L9 1" />
                      </svg>
                    </div>

                    <div className="w-[1px] h-5 bg-charini-border shrink-0 mx-1" />

                    {/* Phone Number Input */}
                    <input
                      id="phone-number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder={phoneCountryCode === "+91" ? "98765 43210" : "Mobile number"}
                      className="w-full px-2 py-2.5 bg-transparent text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 focus:outline-none"
                    />
                  </div>
                  <p className="font-sans text-[10px] text-charini-charcoal-muted mt-1.5 pl-2">
                    Private previews &amp; collection releases directly on WhatsApp.
                  </p>
                </div>

                {profileMessage && (
                  <div className="w-full py-2 px-3 bg-charini-error-bg border border-charini-error/30 text-charini-error text-xs text-center rounded-xl">
                    {profileMessage}
                  </div>
                )}

                {/* Submit Profile Button */}
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="w-full min-h-[50px] py-3.5 px-6 font-sans text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-200 flex items-center justify-center gap-2 mt-2 rounded-full bg-charini-charcoal hover:bg-charini-charcoal-deep text-white cursor-pointer shadow-[0_2px_8px_rgba(26,25,24,0.12)] active:scale-[0.99]"
                >
                  {isSubmittingProfile ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <span>Save Details</span>
                  )}
                </button>

                {/* Skip Link */}
                <div className="text-center mt-1">
                  <button
                    type="button"
                    onClick={() => setIsProfileSaved(true)}
                    className="font-sans text-[11px] text-charini-charcoal-dim hover:text-charini-charcoal underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    I&apos;m done / Skip for now
                  </button>
                </div>
              </form>
            </div>
          )}
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
                className={`w-full min-h-[48px] px-5 py-3 bg-white text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border ${
                  errorField === "email"
                    ? "border-charini-error focus:border-charini-error"
                    : "border-charini-border focus:border-charini-charcoal"
                } transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}
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
                  <div className="flex flex-col gap-2 pt-1 pb-1 animate-fade-in bg-[#FAF9F7] p-3 border border-charini-border/70 rounded-2xl">
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
                    className="w-full min-h-[44px] px-4 py-2 bg-charini-surface text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal transition-colors duration-150 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Consent Checkbox */}
            <label
              htmlFor="marketing-consent"
              className="w-full flex items-start gap-3 pt-1 cursor-pointer select-none group"
            >
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
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
                  className="sr-only peer"
                />
                <div
                  className={`h-4 w-4 rounded-[5px] border transition-all duration-150 flex items-center justify-center ${
                    consent
                      ? "bg-charini-charcoal border-charini-charcoal text-white"
                      : errorField === "consent"
                      ? "bg-white border-charini-error"
                      : "bg-white border-charini-border group-hover:border-charini-charcoal-muted/70 peer-focus-visible:ring-2 peer-focus-visible:ring-charini-charcoal peer-focus-visible:ring-offset-1"
                  }`}
                >
                  {consent && (
                    <svg
                      className="w-2.5 h-2.5 stroke-white"
                      viewBox="0 0 12 12"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-sans text-[11px] sm:text-xs text-charini-charcoal-muted leading-relaxed">
                I agree to receive marketing communications from CHARINI about the updates I have
                selected.
              </span>
            </label>

            {/* Error Message Announcement */}
            {errorMessage && (
              <div
                id="form-error"
                role="alert"
                aria-live="polite"
                className="w-full py-2.5 px-3.5 bg-charini-error-bg border border-charini-error/30 text-charini-error text-xs text-center rounded-xl"
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button (Long button, greyed out until checkbox is agreed to) */}
            <button
              type="submit"
              disabled={!consent || isSubmitting}
              aria-disabled={!consent || isSubmitting}
              className={`w-full min-h-[52px] py-4 px-6 font-sans text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-200 flex items-center justify-center gap-2 mt-2 rounded-full ${
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

      {/* Atelier & Connect Luxury Micro-Footer */}
      <footer className="w-full border-t border-charini-border/70 mt-12 pt-7 pb-4 flex flex-col items-center gap-3.5">
        <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-charini-charcoal-dim">
          Atelier &amp; Connect
        </span>

        {/* Instagram Channels */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href="https://www.instagram.com/charini_official/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] text-xs tracking-wide rounded-full border border-charini-border bg-white text-charini-charcoal hover:border-charini-charcoal hover:bg-[#FAF9F7] transition-all duration-150 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 text-charini-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>@charini_official</span>
          </a>

          <a
            href="https://www.instagram.com/charini.stories/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] text-xs tracking-wide rounded-full border border-charini-border bg-white text-charini-charcoal hover:border-charini-charcoal hover:bg-[#FAF9F7] transition-all duration-150 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 text-charini-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>@charini.stories</span>
          </a>
        </div>

        {/* WhatsApp & Location Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-charini-charcoal-muted pt-0.5">
          <a
            href="https://wa.me/94770468888"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-charini-charcoal transition-colors underline-offset-4 hover:underline"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 text-charini-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>+94 77 046 8888</span>
          </a>

          <span className="text-charini-border select-none">•</span>

          <a
            href="https://maps.app.goo.gl/KdDbdkjUZBjs33qUA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-charini-charcoal transition-colors underline-offset-4 hover:underline"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 text-charini-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Colombo Flagship Store</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
