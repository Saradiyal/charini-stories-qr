"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type {
  InterestTag,
  SubscribeRequestBody,
  SubscribeResponse,
} from "@/lib/subscriptions/contract";
import { ERROR_MESSAGES } from "@/lib/subscriptions/contract";
import {
  STORE_SLUGS,
  SPECIFIC_CUTS_SLUG,
  CUT_TYPE_SLUGS,
  CUT_TYPE_OPTIONS,
} from "@/lib/config";
import { TOP_COUNTRIES, ALL_COUNTRIES } from "@/lib/countries";
import RetailInquiryModal from "./RetailInquiryModal";

interface NewsletterSignupProps {
  initialTags: InterestTag[];
}

interface QuickConnectBarProps {
  onOpenInstagram: () => void;
  onOpenContact: () => void;
}

function QuickConnectBar({ onOpenInstagram, onOpenContact }: QuickConnectBarProps) {
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
        <button
          type="button"
          onClick={onOpenContact}
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
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="font-sans text-[11px] sm:text-xs font-medium tracking-wide">Contact</span>
        </button>

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
          Follow on Instagram
        </h3>
        <p className="font-sans text-xs text-charini-charcoal-muted mb-5">
          Select an account to explore our worlds
        </p>

        {/* Options */}
        <div className="w-full flex flex-col gap-2.5">
          {/* CHARINI Option */}
          <a
            href="https://www.instagram.com/charinibrand/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-white border border-charini-border hover:border-charini-charcoal hover:bg-[#FAF9F7] text-charini-charcoal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white border border-charini-border/70 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                <Image
                  src="/charinilogo.png"
                  alt="CHARINI"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-sans text-xs font-semibold tracking-wider uppercase text-charini-charcoal truncate">
                  CHARINI
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-muted truncate">
                  Contemporary Couture &amp; Silhouettes
                </span>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-charini-charcoal-dim group-hover:text-charini-charcoal group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-white border border-charini-border hover:border-charini-charcoal hover:bg-[#FAF9F7] text-charini-charcoal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#0D352B] border border-charini-border/40 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                <Image
                  src="/charinistorieslogo.png"
                  alt="CHARINI STORIES"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-sans text-xs font-semibold tracking-wider uppercase text-charini-charcoal truncate">
                  CHARINI STORIES
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-muted truncate">
                  Ready-to-Wear with a Story
                </span>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-charini-charcoal-dim group-hover:text-charini-charcoal group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
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

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ContactModal({ isOpen, onClose }: ContactModalProps) {
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
      aria-labelledby="contact-modal-title"
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

        {/* Contact Icon Badge */}
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
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h3
          id="contact-modal-title"
          className="font-serif text-xl text-charini-charcoal font-normal tracking-tight mb-1"
        >
          Get in Touch
        </h3>
        <p className="font-sans text-xs text-charini-charcoal-muted mb-5">
          Reach our boutique &amp; styling team
        </p>

        {/* Contact Options */}
        <div className="w-full flex flex-col gap-2.5">
          {/* WhatsApp Chat Option */}
          <a
            href="https://wa.me/94770468888"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-white border border-charini-border hover:border-charini-charcoal hover:bg-[#FAF9F7] text-charini-charcoal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 shrink-0 flex items-center justify-center shadow-xs">
                <svg
                  className="w-4 h-4 text-[#25D366]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-sans text-xs font-semibold tracking-wider uppercase text-charini-charcoal truncate">
                  WhatsApp Chat
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-muted truncate">
                  Instant messaging &amp; styling advice
                </span>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-charini-charcoal-dim group-hover:text-charini-charcoal group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
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

          {/* Speak with Us Option */}
          <a
            href="tel:+94770468888"
            onClick={onClose}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-white border border-charini-border hover:border-charini-charcoal hover:bg-[#FAF9F7] text-charini-charcoal transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-charini-charcoal/5 border border-charini-charcoal/10 shrink-0 flex items-center justify-center shadow-xs">
                <svg
                  className="w-4 h-4 text-charini-charcoal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-sans text-xs font-semibold tracking-wider uppercase text-charini-charcoal truncate">
                  Speak with Us
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-muted truncate">
                  Direct voice call to our boutique
                </span>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-charini-charcoal-dim group-hover:text-charini-charcoal group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
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

function formatCampaignName(param: string | null): string {
  if (!param) return "Mumbai Pop-up";
  const cleaned = decodeURIComponent(param).replace(/-/g, " ").trim();
  if (!cleaned) return "Mumbai Pop-up";
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function NewsletterSignup({ initialTags }: NewsletterSignupProps) {
  const searchParams = useSearchParams();

  // Detect campaign name from query string (?campaign= or ?source=), default to "Mumbai Pop-up"
  const rawCampaign = searchParams.get("campaign") || searchParams.get("source");
  const campaignName = useMemo(() => formatCampaignName(rawCampaign), [rawCampaign]);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "email">("whatsapp");
  const [email, setEmail] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("IN"); // Default India +91 for Mumbai
  const activeCountry = useMemo(
    () => ALL_COUNTRIES.find((c) => c.code === selectedCountryCode) || TOP_COUNTRIES[0],
    [selectedCountryCode]
  );
  const phoneCountryCode = activeCountry.dialCode;
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["charini", "charini-stories"]);
  const [specificCutsNote, setSpecificCutsNote] = useState("");
  const [consent, setConsent] = useState(false);

  // Profile details state (on completion screen if they want to give last name)
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [lastName, setLastName] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  // Modals
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRetailModalOpen, setIsRetailModalOpen] = useState(false);

  const renderTimeRef = useRef<number>(0);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const storeSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderTimeRef.current = Date.now();
  }, []);

  const storeTags = initialTags.filter((tag) =>
    (STORE_SLUGS as readonly string[]).includes(tag.slug)
  );

  const availableStoreTags =
    storeTags.length > 0
      ? storeTags
      : [
          { slug: "charini", label: "CHARINI" },
          { slug: "charini-stories", label: "CHARINI STORIES" },
        ];

  // Cut type tags (Versatile Skirts, Shirt Dresses, etc.)
  const cutTypeTagsFromProps = initialTags.filter((tag) =>
    (CUT_TYPE_SLUGS as readonly string[]).includes(tag.slug as any)
  );
  const availableCutTypeTags: InterestTag[] =
    cutTypeTagsFromProps.length > 0
      ? cutTypeTagsFromProps
      : (CUT_TYPE_OPTIONS as unknown as InterestTag[]);

  // Main updates tags (New Prints, New Cuts, Collections, Special Releases, Specific Cuts)
  const updateTags = initialTags.filter(
    (tag) =>
      !(STORE_SLUGS as readonly string[]).includes(tag.slug) &&
      !(CUT_TYPE_SLUGS as readonly string[]).includes(tag.slug as any)
  );
  const availableUpdateTags: InterestTag[] =
    updateTags.length > 0
      ? updateTags
      : [
          { slug: "new-prints", label: "New Prints" },
          { slug: "new-cuts", label: "New Cuts" },
          { slug: "collections", label: "Collections" },
          { slug: "special-releases", label: "Special Releases" },
          { slug: "specific-cuts", label: "Specific Cuts" },
        ];

  const isSpecificCutsSelected = selectedInterests.includes(SPECIFIC_CUTS_SLUG);

  const hasStoreSelected = selectedInterests.some((s) =>
    (STORE_SLUGS as readonly string[]).includes(s)
  );

  const toggleInterest = (slug: string) => {
    setSelectedInterests((prev) => {
      const isSelected = prev.includes(slug);
      if (isSelected) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorField(null);

    const trimmedFirstName = firstName.trim();
    const trimmedEmail = email.trim();
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // 1. Validate First Name
    if (!trimmedFirstName) {
      setErrorMessage("Please enter your first name.");
      setErrorField("firstName");
      firstNameInputRef.current?.focus();
      return;
    }

    // 2. Validate Contact Channel
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

    // 3. Validate at least one brand selected
    if (!hasStoreSelected) {
      setErrorMessage("Please select at least one brand (CHARINI or CHARINI STORIES).");
      setErrorField("stores");
      storeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 4. Validate marketing consent
    if (!consent) {
      setErrorMessage("Please confirm your consent to receive updates.");
      setErrorField("consent");
      return;
    }

    setIsSubmitting(true);

    try {
      const elapsedMs = renderTimeRef.current > 0 ? Date.now() - renderTimeRef.current : 2000;

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
        firstName: trimmedFirstName,
        email: contactMethod === "email" ? trimmedEmail : null,
        phoneCountryCode: contactMethod === "whatsapp" ? phoneCountryCode : null,
        phoneNumber: contactMethod === "whatsapp" ? cleanPhone : null,
        interests: selectedInterests,
        specificCutsNote: finalNote,
        marketingConsent: consent,
        source: campaignName,
        preferredContactMethod: contactMethod,
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
          if (data.field === "firstName") {
            firstNameInputRef.current?.focus();
          } else if (data.field === "email") {
            emailInputRef.current?.focus();
          } else if (data.field === "phone") {
            phoneInputRef.current?.focus();
          }
        } else {
          setErrorMessage(ERROR_MESSAGES.server_error);
        }
        return;
      }

      if (data.ok && data.subscriberId) {
        setSubscriberId(data.subscriberId);
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage(ERROR_MESSAGES.network);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionalProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() && !email.trim() && !phoneNumber.trim()) {
      setIsProfileSaved(true);
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const res = await fetch("/api/subscriber/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberId,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          email: email.trim() || null,
          phoneCountryCode: phoneNumber.trim() ? phoneCountryCode : null,
          phoneNumber: phoneNumber.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setIsProfileSaved(true);
      }
    } catch {
      setIsProfileSaved(true);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto px-5 py-8 sm:py-12 flex flex-col items-center">
      {/* Brand Emblem Header */}
      <header className="mb-6 sm:mb-8 flex flex-col items-center">
        <div className="relative w-[115px] sm:w-[130px] aspect-[3256/4088] drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <Image
            src="/brand/charini-emblem.png"
            alt="CHARINI"
            fill
            priority
            sizes="(max-width: 640px) 115px, 130px"
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
          <div className="py-8 sm:py-12 flex flex-col items-center w-full">
            {/* Elegant Checkmark Badge */}
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

            {/* Welcome Screen Headings */}
            <h1 className="font-serif text-2xl sm:text-3xl text-charini-charcoal font-normal tracking-tight mb-3">
              Welcome to the World of CHARINI
            </h1>
            <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[340px] mb-8 font-normal">
              Thank you for joining us. We look forward to sharing our newest stories, collections and exclusive invitations with you.
            </p>

            {/* Quick Connect & Atelier Hub */}
            <div className="w-full max-w-[360px] mb-6">
              <QuickConnectBar
                onOpenInstagram={() => setIsInstagramModalOpen(true)}
                onOpenContact={() => setIsContactModalOpen(true)}
              />
            </div>

            {/* Optional profile expansion */}
            {!isProfileSaved && (
              <div className="w-full max-w-[360px] mt-2">
                {!showOptionalProfile ? (
                  <button
                    type="button"
                    onClick={() => setShowOptionalProfile(true)}
                    className="font-sans text-[11px] text-charini-charcoal-dim hover:text-charini-charcoal underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Add last name for personal invitations (optional) &rarr;
                  </button>
                ) : (
                  <form
                    onSubmit={handleOptionalProfileSubmit}
                    className="flex flex-col gap-3 p-4 bg-[#FAF9F7] border border-charini-border rounded-2xl text-left animate-fade-in"
                  >
                    <label
                      htmlFor="optional-last-name"
                      className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal"
                    >
                      Last Name
                    </label>
                    <input
                      id="optional-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Your last name"
                      className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs text-charini-charcoal border border-charini-border rounded-full"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="w-full py-2.5 rounded-full bg-charini-charcoal text-white text-[11px] font-semibold tracking-wider uppercase hover:bg-charini-charcoal-deep transition-all"
                    >
                      {isSubmittingProfile ? "Saving..." : "Save Details"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <main className="w-full flex flex-col items-center">
          {/* Hero Headings */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-3xl sm:text-[38px] text-charini-charcoal font-normal tracking-tight leading-tight mb-3">
              Enter the World of CHARINI
            </h1>
            <div className="space-y-2.5 max-w-[380px] mx-auto">
              <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed font-normal">
                Where stories become wearable art. Inspired by Sri Lanka and beyond, celebrating creativity, craftsmanship and individuality.
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed font-normal">
                Join our circle for exclusive previews, new collections and private invitations.
              </p>
            </div>
          </div>

          {/* Quick Connect Hub */}
          <QuickConnectBar
            onOpenInstagram={() => setIsInstagramModalOpen(true)}
            onOpenContact={() => setIsContactModalOpen(true)}
          />

          {/* Section Divider */}
          <div className="relative flex py-2 items-center mb-7 w-full">
            <div className="flex-grow border-t border-charini-border/70" />
            <span className="flex-shrink mx-3 font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-charini-charcoal-dim">
              Join the Circle
            </span>
            <div className="flex-grow border-t border-charini-border/70" />
          </div>

          {/* Streamlined Form with Generous Luxury Spacing */}
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-6 sm:gap-7">
            {/* 1. First Name Field */}
            <div className="flex flex-col">
              <label
                htmlFor="first-name"
                className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-charini-charcoal mb-2.5"
              >
                First Name *
              </label>
              <input
                ref={firstNameInputRef}
                id="first-name"
                name="first-name"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errorField === "firstName") {
                    setErrorMessage(null);
                    setErrorField(null);
                  }
                }}
                placeholder="Enter your first name"
                className={`w-full min-h-[50px] px-5 py-3.5 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border ${
                  errorField === "firstName"
                    ? "border-charini-error focus:border-charini-error"
                    : "border-charini-border focus:border-charini-charcoal"
                } transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}
              />
            </div>

            {/* 2. Preferred Contact Method & Details */}
            <div className="w-full flex flex-col">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-charini-charcoal">
                  Preferred Contact Method
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-dim">
                  Choose one
                </span>
              </div>

              {/* Segmented Toggle: WhatsApp vs Email */}
              <div className="grid grid-cols-2 p-1.5 bg-[#FAF9F7] border border-charini-border rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod("whatsapp");
                    if (errorField === "phone" || errorField === "email") {
                      setErrorMessage(null);
                      setErrorField(null);
                    }
                  }}
                  className={`py-2.5 px-3 text-xs font-medium rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                    contactMethod === "whatsapp"
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

                <button
                  type="button"
                  onClick={() => {
                    setContactMethod("email");
                    if (errorField === "phone" || errorField === "email") {
                      setErrorMessage(null);
                      setErrorField(null);
                    }
                  }}
                  className={`py-2.5 px-3 text-xs font-medium rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
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
              </div>

              {/* Dynamic Input based on selection */}
              {contactMethod === "whatsapp" ? (
                <div className="flex flex-col">
                  {/* WhatsApp Mobile Container */}
                  <div
                    className={`flex items-center w-full min-h-[50px] bg-white border ${
                      errorField === "phone"
                        ? "border-charini-error focus-within:border-charini-error"
                        : "border-charini-border focus-within:border-charini-charcoal"
                    } transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-2.5`}
                  >
                    {/* Compact Country Code Selector */}
                    <div className="relative flex items-center shrink-0 pl-2 pr-1.5 py-1 cursor-pointer">
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
                        if (errorField === "phone") {
                          setErrorMessage(null);
                          setErrorField(null);
                        }
                      }}
                      placeholder={activeCountry.code === "IN" ? "98765 43210" : "Mobile number"}
                      className="flex-1 min-w-0 px-2.5 py-2.5 bg-transparent text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 focus:outline-none"
                    />
                  </div>
                  <p className="font-sans text-[11px] text-charini-charcoal-muted mt-2 pl-3">
                    Private previews &amp; collection releases directly on WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <input
                    ref={emailInputRef}
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorField === "email") {
                        setErrorMessage(null);
                        setErrorField(null);
                      }
                    }}
                    placeholder="Enter your email address"
                    className={`w-full min-h-[50px] px-5 py-3 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border ${
                      errorField === "email"
                        ? "border-charini-error focus:border-charini-error"
                        : "border-charini-border focus:border-charini-charcoal"
                    } transition-colors duration-150 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}
                  />
                  <p className="font-sans text-[11px] text-charini-charcoal-muted mt-2 pl-3">
                    Lookbooks, invitations &amp; collection releases sent to your inbox.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Brand Selection */}
            <div ref={storeSectionRef} className="w-full flex flex-col">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-charini-charcoal">
                  Select Brand
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-dim">
                  Select one or both
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {availableStoreTags.map((tag) => {
                  const isSelected = selectedInterests.includes(tag.slug);
                  const isCharini = tag.slug === "charini";
                  const logoSrc = isCharini ? "/charinilogo.png" : "/charinistorieslogo.png";

                  return (
                    <label
                      key={tag.slug}
                      className={`flex items-center justify-center gap-2 sm:gap-2.5 px-3 py-3 min-h-[48px] rounded-full border cursor-pointer select-none transition-all duration-150 active:scale-[0.98] ${
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

                      {/* Store Logo Circle */}
                      <div
                        className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full overflow-hidden shrink-0 flex items-center justify-center shadow-xs ${
                          isCharini
                            ? isSelected
                              ? "bg-white border border-white/30 p-1"
                              : "bg-white border border-charini-border/80 p-1"
                            : isSelected
                            ? "bg-[#0D352B] border border-white/30 p-0.5"
                            : "bg-[#0D352B] border border-[#0D352B] p-0.5"
                        }`}
                      >
                        <Image
                          src={logoSrc}
                          alt={tag.label}
                          width={30}
                          height={30}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Store Label */}
                      <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-wider uppercase truncate">
                        {tag.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3b. What would you like to hear about? */}
            <div className="w-full flex flex-col">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-charini-charcoal">
                  What would you like to hear about?
                </span>
                <span className="font-sans text-[10px] text-charini-charcoal-dim">
                  Optional
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableUpdateTags.map((tag) => {
                  const isSelected = selectedInterests.includes(tag.slug);
                  return (
                    <label
                      key={tag.slug}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs tracking-wide rounded-full border cursor-pointer select-none transition-all duration-150 active:scale-[0.98] ${
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

              {/* Conditional Specific Cuts Area */}
              {isSpecificCutsSelected && (
                <div className="mt-3 flex flex-col gap-2.5 animate-fade-in bg-[#FAF9F7] p-3.5 border border-charini-border/70 rounded-2xl">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[10px] font-semibold tracking-[0.14em] uppercase text-charini-charcoal">
                      Cut Types:
                    </span>
                    <span className="font-sans text-[10px] text-charini-charcoal-dim">
                      STORIES Cuts
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableCutTypeTags.map((tag) => {
                      const isSelected = selectedInterests.includes(tag.slug);
                      return (
                        <label
                          key={tag.slug}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 min-h-[32px] text-[11px] tracking-wide rounded-full border cursor-pointer select-none transition-all duration-150 active:scale-[0.98] ${
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

                  {/* Custom Cut Notes input */}
                  <input
                    type="text"
                    maxLength={500}
                    value={specificCutsNote}
                    onChange={(e) => setSpecificCutsNote(e.target.value)}
                    placeholder="Any other specific cuts or requests (optional)"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal transition-colors duration-150 rounded-full mt-1"
                  />
                </div>
              )}
            </div>

            {/* 4. Marketing Consent Checkbox */}
            <div className="pt-2 pb-1 w-full">
              <label
                htmlFor="marketing-consent"
                className="w-full flex items-center gap-3 cursor-pointer select-none group"
              >
                <div className="relative flex items-center justify-center shrink-0">
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
                    className={`h-4.5 w-4.5 rounded-[5px] border transition-all duration-150 flex items-center justify-center ${
                      consent
                        ? "bg-charini-charcoal border-charini-charcoal text-white"
                        : errorField === "consent"
                        ? "bg-white border-charini-error"
                        : "bg-white border-charini-border group-hover:border-charini-charcoal-muted/70 peer-focus-visible:ring-2 peer-focus-visible:ring-charini-charcoal"
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
                <span className="font-sans text-xs text-charini-charcoal-muted leading-relaxed">
                  I agree to receive communications from CHARINI.
                </span>
              </label>
            </div>

            {/* Error Message Announcement */}
            {errorMessage && (
              <div
                id="form-error"
                role="alert"
                aria-live="polite"
                className="w-full py-2.5 px-3.5 bg-charini-error-bg border border-charini-error/30 text-charini-error text-xs text-center rounded-xl animate-fade-in"
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!consent || isSubmitting}
              aria-disabled={!consent || isSubmitting}
              className={`w-full min-h-[52px] py-4 px-6 font-sans text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-200 flex items-center justify-center gap-2 rounded-full mt-2 ${
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
                  <span>Joining...</span>
                </>
              ) : (
                <span>Join the CHARINI Circle</span>
              )}
            </button>
          </form>

          {/* Campaign Pill at Bottom (with generous breathing room from Join the CHARINI Circle) */}
          <div className="w-full flex justify-center pt-14 sm:pt-20 pb-4">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-charini-charcoal/5 border border-charini-border text-[10px] sm:text-[11px] font-sans font-medium tracking-widest uppercase text-charini-charcoal">
              <span>{campaignName}</span>
            </div>
          </div>
        </main>
      )}

      {/* Instagram Selection Modal */}
      <InstagramModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
      />

      {/* Contact Selection Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Retail Inquiry Modal */}
      <RetailInquiryModal
        isOpen={isRetailModalOpen}
        onClose={() => setIsRetailModalOpen(false)}
        campaignSource={campaignName}
      />
    </div>
  );
}
