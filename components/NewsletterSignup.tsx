"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import type {
  InterestTag,
  SubscribeRequestBody,
  SubscribeResponse,
} from "@/lib/subscriptions/contract";
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

interface QuickConnectBarProps {
  onOpenInstagram: () => void;
}

function QuickConnectBar({ onOpenInstagram }: QuickConnectBarProps) {
  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Instagram Button */}
        <button
          type="button"
          onClick={onOpenInstagram}
          className="flex items-center justify-center gap-1.5 min-h-[42px] px-2 py-2 rounded-full border border-charini-border bg-white text-charini-charcoal hover:border-charini-charcoal hover:bg-[#FAF9F7] active:scale-[0.98] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer group"
        >
          <svg
            className="w-3.5 h-3.5 text-charini-charcoal shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <span className="font-sans text-[11px] sm:text-xs font-medium tracking-wide">Instagram</span>
        </button>

        {/* Contact Button */}
        <a
          href="https://wa.me/94770468888"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 min-h-[42px] px-2 py-2 rounded-full border border-charini-border bg-white text-charini-charcoal hover:border-charini-charcoal hover:bg-[#FAF9F7] active:scale-[0.98] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
        >
          <svg
            className="w-3.5 h-3.5 text-charini-charcoal shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="font-sans text-[11px] sm:text-xs font-medium tracking-wide">Contact</span>
        </a>

        {/* Location Button */}
        <a
          href="https://maps.app.goo.gl/KdDbdkjUZBjs33qUA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 min-h-[42px] px-2 py-2 rounded-full border border-charini-border bg-white text-charini-charcoal hover:border-charini-charcoal hover:bg-[#FAF9F7] active:scale-[0.98] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
        >
          <svg
            className="w-3.5 h-3.5 text-charini-charcoal shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-sans text-[11px] sm:text-xs font-medium tracking-wide">Location</span>
        </a>
      </div>
    </div>
  );
}

interface InstagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function InstagramModal({ isOpen, onClose }: InstagramModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="instagram-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] p-6 bg-[#FAF9F7] border border-charini-border rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-charini-charcoal-dim hover:text-charini-charcoal p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Instagram Icon Badge */}
        <div className="w-10 h-10 rounded-full bg-white border border-charini-border flex items-center justify-center mb-3 shadow-sm">
          <svg
            className="w-5 h-5 text-charini-charcoal"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h3
          id="instagram-modal-title"
          className="font-serif text-xl text-charini-charcoal font-normal tracking-tight mb-1"
        >
          Instagram
        </h3>
        <p className="font-sans text-xs text-charini-charcoal-muted mb-5">
          Select an account to explore
        </p>

        {/* Account Options */}
        <div className="w-full flex flex-col gap-2.5">
          {/* CHARINI Option */}
          <a
            href="https://www.instagram.com/charini_official/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-white border border-charini-border hover:border-charini-charcoal hover:bg-[#FAF9F7] text-charini-charcoal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] group"
          >
            <div className="flex flex-col text-left">
              <span className="font-sans text-xs font-semibold tracking-wider uppercase text-charini-charcoal">
                CHARINI
              </span>
              <span className="font-sans text-[10px] text-charini-charcoal-muted">
                Main Label
              </span>
            </div>
            <svg
              className="w-4 h-4 text-charini-charcoal-dim group-hover:text-charini-charcoal group-hover:translate-x-0.5 transition-all"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>

          {/* CHARINI STORIES Option */}
          <a
            href="https://www.instagram.com/charini.stories/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-white border border-charini-border hover:border-charini-charcoal hover:bg-[#FAF9F7] text-charini-charcoal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] group"
          >
            <div className="flex flex-col text-left">
              <span className="font-sans text-xs font-semibold tracking-wider uppercase text-charini-charcoal">
                CHARINI STORIES
              </span>
              <span className="font-sans text-[10px] text-charini-charcoal-muted">
                Prints &amp; Silks
              </span>
            </div>
            <svg
              className="w-4 h-4 text-charini-charcoal-dim group-hover:text-charini-charcoal group-hover:translate-x-0.5 transition-all"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterSignup({ initialTags }: NewsletterSignupProps) {
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [specificCutsNote, setSpecificCutsNote] = useState("");
  const [consent, setConsent] = useState(false);

  // Profile details state (Thank You page)
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("IN"); // Default to India (IN)
  const activeCountry = useMemo(
    () => ALL_COUNTRIES.find((c) => c.code === selectedCountryCode) || TOP_COUNTRIES[0],
    [selectedCountryCode]
  );
  const phoneCountryCode = activeCountry.dialCode;
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);

  const renderTimeRef = useRef<number>(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
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
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // 1. Validate contact presence & format depending on chosen method
    if (contactMethod === "email") {
      if (!trimmedEmail) {
        setErrorMessage(ERROR_MESSAGES.email_required);
        setErrorField("email");
        emailInputRef.current?.focus();
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage(ERROR_MESSAGES.invalid_email);
        setErrorField("email");
        emailInputRef.current?.focus();
        return;
      }
    } else {
      if (!cleanPhone) {
        setErrorMessage(ERROR_MESSAGES.phone_required);
        setErrorField("phone");
        phoneInputRef.current?.focus();
        return;
      }
      if (cleanPhone.length < 6 || cleanPhone.length > 15) {
        setErrorMessage(ERROR_MESSAGES.invalid_phone);
        setErrorField("phone");
        phoneInputRef.current?.focus();
        return;
      }
    }

    // 2. Validate at least one store selected
    if (!hasStoreSelected) {
      setErrorMessage(ERROR_MESSAGES.store_required);
      setErrorField("stores");
      storeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 3. Validate marketing consent
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

      const payload: SubscribeRequestBody = {
        email: contactMethod === "email" ? trimmedEmail : null,
        phoneCountryCode: contactMethod === "phone" ? phoneCountryCode : null,
        phoneNumber: contactMethod === "phone" ? cleanPhone : null,
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
          } else if (data.field === "phone") {
            phoneInputRef.current?.focus();
          } else if (data.field === "stores") {
            storeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          setErrorMessage(ERROR_MESSAGES.server_error);
        }
        return;
      }

      if (data.ok && data.subscriberId) {
        setSubscriberId(data.subscriberId);
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
        setSelectedCountryCode(match.code);
        const remainder = val.slice(match.dialCode.length).trim().replace(/[^\d\s-]/g, "");
        setPhoneNumber(remainder);
        return;
      }
    }
    // Auto-strip leading 0 if Indian number (+91)
    let clean = val.replace(/[^\d\s-]/g, "");
    if (activeCountry.code === "IN" && clean.startsWith("0")) {
      clean = clean.replace(/^0+/, "");
    }
    setPhoneNumber(clean);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If all profile fields are empty, mark complete
    const isComplementaryEmpty =
      contactMethod === "email" ? !phoneNumber.trim() : !email.trim();
    if (!firstName.trim() && !lastName.trim() && isComplementaryEmpty) {
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
          subscriberId,
          email: email.trim() || null,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          phoneCountryCode: phoneNumber.trim() ? phoneCountryCode : null,
          phoneNumber: phoneNumber.trim() || null,
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
              <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[320px] mb-8">
                Thank you for subscribing. We look forward to welcoming you at the CHARINI pop-up!
              </p>
              <QuickConnectBar onOpenInstagram={() => setIsInstagramModalOpen(true)} />
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

                {/* Complementary Field: Phone if subscribed with Email, or Email if subscribed with Phone */}
                {contactMethod === "email" ? (
                  <div className="flex flex-col">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <label
                        htmlFor="phone-number"
                        className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal"
                      >
                        Contact Number
                      </label>
                      <span className="font-sans text-[10px] text-charini-charcoal-dim">
                        WhatsApp (Optional)
                      </span>
                    </div>

                    {/* Unified Curved Input Container */}
                    <div className="flex items-center w-full min-h-[48px] bg-white border border-charini-border focus-within:border-charini-charcoal transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-2">
                      {/* Compact Country Code Selector */}
                      <div className="relative flex items-center shrink-0 pl-2.5 pr-1.5 py-1 cursor-pointer">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-charini-charcoal font-medium select-none pointer-events-none">
                          <span className="text-base leading-none">{activeCountry.flag}</span>
                          <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-charini-charcoal">
                            {activeCountry.short}
                          </span>
                          <span className="text-xs sm:text-sm text-charini-charcoal-dim">
                            {activeCountry.dialCode}
                          </span>
                          <svg
                            className="w-3 h-3 text-charini-charcoal-dim ml-0.5"
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
                        <select
                          id="country-code"
                          aria-label="Country dial code"
                          value={selectedCountryCode}
                          onChange={(e) => setSelectedCountryCode(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                          <optgroup label="Popular">
                            {TOP_COUNTRIES.map((c) => (
                              <option key={`top-profile-${c.code}`} value={c.code}>
                                {c.flag} {c.name} ({c.short} {c.dialCode})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="All Countries">
                            {ALL_COUNTRIES.map((c) => (
                              <option key={`all-profile-${c.code}`} value={c.code}>
                                {c.flag} {c.name} ({c.short} {c.dialCode})
                              </option>
                            ))}
                          </optgroup>
                        </select>
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
                        placeholder={activeCountry.code === "IN" ? "98765 43210" : "Mobile number"}
                        className="flex-1 min-w-0 px-2 py-2.5 bg-transparent text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 focus:outline-none"
                      />
                    </div>
                    <p className="font-sans text-[10px] text-charini-charcoal-muted mt-1.5 pl-2">
                      Private previews &amp; collection releases directly on WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <label
                        htmlFor="profile-email"
                        className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal"
                      >
                        Email Address
                      </label>
                      <span className="font-sans text-[10px] text-charini-charcoal-dim">
                        Optional
                      </span>
                    </div>
                    <input
                      id="profile-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full min-h-[48px] px-5 py-2.5 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                    <p className="font-sans text-[10px] text-charini-charcoal-muted mt-1.5 pl-2">
                      For digital lookbooks, invitations &amp; print stories.
                    </p>
                  </div>
                )}

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
          <div className="text-center mb-6">
            <h1 className="font-serif text-3xl sm:text-[38px] text-charini-charcoal font-normal tracking-tight leading-tight mb-2.5">
              Stay in the loop.
            </h1>
            <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[360px] mx-auto font-normal">
              Be the first to hear about new prints, new cuts, collections and special releases.
            </p>
          </div>

          {/* Quick Connect & Atelier Hub */}
          <QuickConnectBar onOpenInstagram={() => setIsInstagramModalOpen(true)} />

          {/* Section Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-charini-border/70" />
            <span className="flex-shrink mx-3 font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-charini-charcoal-dim">
              Newsletter Signup
            </span>
            <div className="flex-grow border-t border-charini-border/70" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-6">
            {/* Contact Channel Selector & Input */}
            <div className="w-full flex flex-col">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-sans text-[11px] font-medium tracking-[0.14em] uppercase text-charini-charcoal">
                  Subscribe Via
                </span>
                <span className="font-sans text-[11px] text-charini-charcoal-dim">
                  Email or WhatsApp
                </span>
              </div>

              {/* Segmented Luxury Pill Toggle */}
              <div className="grid grid-cols-2 p-1 bg-[#FAF9F7] border border-charini-border rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod("email");
                    if (errorField === "email" || errorField === "phone" || errorField === "contact") {
                      setErrorMessage(null);
                      setErrorField(null);
                    }
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                    contactMethod === "email"
                      ? "bg-charini-charcoal text-white shadow-sm"
                      : "text-charini-charcoal-muted hover:text-charini-charcoal"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContactMethod("phone");
                    if (errorField === "email" || errorField === "phone" || errorField === "contact") {
                      setErrorMessage(null);
                      setErrorField(null);
                    }
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                    contactMethod === "phone"
                      ? "bg-charini-charcoal text-white shadow-sm"
                      : "text-charini-charcoal-muted hover:text-charini-charcoal"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Dynamic Input based on contactMethod */}
              {contactMethod === "email" ? (
                <div className="flex flex-col">
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
                      if (errorField === "email" || errorField === "contact") {
                        setErrorMessage(null);
                        setErrorField(null);
                      }
                    }}
                    placeholder="Enter your email address"
                    aria-required="true"
                    aria-invalid={errorField === "email" || errorField === "contact" ? "true" : undefined}
                    aria-describedby={
                      errorMessage && (errorField === "email" || errorField === "contact")
                        ? "form-error"
                        : undefined
                    }
                    className={`w-full min-h-[48px] px-5 py-3 bg-white text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border ${
                      errorField === "email" || errorField === "contact"
                        ? "border-charini-error focus:border-charini-error"
                        : "border-charini-border focus:border-charini-charcoal"
                    } transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}
                  />
                  <p className="font-sans text-[10px] text-charini-charcoal-muted mt-1.5 pl-2">
                    Lookbooks, invitations &amp; collection releases sent to your inbox.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* WhatsApp Mobile Container */}
                  <div
                    className={`flex items-center w-full min-h-[48px] bg-white border ${
                      errorField === "phone" || errorField === "contact"
                        ? "border-charini-error focus-within:border-charini-error"
                        : "border-charini-border focus-within:border-charini-charcoal"
                    } transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-2`}
                  >
                    {/* Compact Country Code Selector */}
                    <div className="relative flex items-center shrink-0 pl-2.5 pr-1.5 py-1 cursor-pointer">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-charini-charcoal font-medium select-none pointer-events-none">
                        <span className="text-base leading-none">{activeCountry.flag}</span>
                        <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-charini-charcoal">
                          {activeCountry.short}
                        </span>
                        <span className="text-xs sm:text-sm text-charini-charcoal-dim">
                          {activeCountry.dialCode}
                        </span>
                        <svg
                          className="w-3 h-3 text-charini-charcoal-dim ml-0.5"
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
                      <select
                        id="signup-country-code"
                        aria-label="Country dial code"
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <optgroup label="Popular">
                          {TOP_COUNTRIES.map((c) => (
                            <option key={`top-signup-${c.code}`} value={c.code}>
                              {c.flag} {c.name} ({c.short} {c.dialCode})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="All Countries">
                          {ALL_COUNTRIES.map((c) => (
                            <option key={`all-signup-${c.code}`} value={c.code}>
                              {c.flag} {c.name} ({c.short} {c.dialCode})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="w-[1px] h-5 bg-charini-border shrink-0 mx-1" />

                    {/* Phone Number Input */}
                    <input
                      ref={phoneInputRef}
                      id="signup-phone-number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phoneNumber}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value);
                        if (errorField === "phone" || errorField === "contact") {
                          setErrorMessage(null);
                          setErrorField(null);
                        }
                      }}
                      placeholder={activeCountry.code === "IN" ? "98765 43210" : "Mobile number"}
                      className="flex-1 min-w-0 px-2 py-2.5 bg-transparent text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 focus:outline-none"
                    />
                  </div>
                  <p className="font-sans text-[10px] text-charini-charcoal-muted mt-1.5 pl-2">
                    Private previews &amp; collection releases directly on WhatsApp.
                  </p>
                </div>
              )}
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



      {/* Instagram Selection Modal */}
      <InstagramModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
      />
    </div>
  );
}
