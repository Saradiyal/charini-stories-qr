"use client";

import React, { useState, useEffect } from "react";

interface RetailInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignSource?: string;
}

export default function RetailInquiryModal({
  isOpen,
  onClose,
  campaignSource = "Mumbai Pop-up",
}: RetailInquiryModalProps) {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [inquiryType, setInquiryType] = useState<
    "boutique_stockist" | "trunk_show" | "press_styling" | "other"
  >("boutique_stockist");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !organization.trim()) {
      setErrorMessage("Please fill in your name, boutique/organization, and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/retail-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          organization: organization.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          location: location.trim() || null,
          inquiryType,
          message: message.trim() || null,
          source: campaignSource,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message || "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again or reach out to us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] max-h-[90vh] overflow-y-auto p-6 sm:p-7 bg-[#FAF9F7] border border-charini-border rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] text-left flex flex-col"
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

        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-charini-charcoal text-white flex items-center justify-center mb-4 shadow-sm">
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
            <h3 className="font-serif text-2xl text-charini-charcoal mb-2">
              Thank You for Reaching Out
            </h3>
            <p className="font-sans text-xs sm:text-[13px] text-charini-charcoal-muted leading-relaxed max-w-[340px] mb-6">
              Our studio &amp; partnership team has received your details and will be in touch with line sheets and collection lookbooks shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-charini-charcoal text-white text-xs font-semibold tracking-wider uppercase hover:bg-charini-charcoal-deep transition-all"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-charini-charcoal-dim">
                B2B &amp; Partnerships
              </span>
              <h3
                id="retail-modal-title"
                className="font-serif text-2xl text-charini-charcoal font-normal tracking-tight mt-1 mb-1.5"
              >
                Retail &amp; Wholesale Enquiries
              </h3>
              <p className="font-sans text-xs text-charini-charcoal-muted leading-relaxed">
                Connect with our team for boutique stockist curation, trunk show showcases, and brand collaborations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="retail-name"
                    className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                  >
                    Your Name *
                  </label>
                  <input
                    id="retail-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal rounded-full transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="retail-org"
                    className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                  >
                    Boutique / Store *
                  </label>
                  <input
                    id="retail-org"
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Store or Company name"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal rounded-full transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="retail-email"
                    className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                  >
                    Work Email *
                  </label>
                  <input
                    id="retail-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@boutique.com"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal rounded-full transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="retail-phone"
                    className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                  >
                    Phone / WhatsApp
                  </label>
                  <input
                    id="retail-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal rounded-full transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="retail-city"
                    className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                  >
                    City &amp; Country
                  </label>
                  <input
                    id="retail-city"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs sm:text-sm text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal rounded-full transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="retail-type"
                    className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                  >
                    Inquiry Type
                  </label>
                  <select
                    id="retail-type"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as any)}
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white text-xs sm:text-sm text-charini-charcoal border border-charini-border focus:border-charini-charcoal rounded-full transition-colors"
                  >
                    <option value="boutique_stockist">Boutique Stockist</option>
                    <option value="trunk_show">Trunk Show / Pop-Up</option>
                    <option value="press_styling">Press &amp; Celebrity Styling</option>
                    <option value="other">Other Collaboration</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="retail-notes"
                  className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-charini-charcoal mb-1"
                >
                  Notes / Specific Requirements (Optional)
                </label>
                <textarea
                  id="retail-notes"
                  rows={2}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your store, client profile or upcoming event..."
                  className="w-full px-3.5 py-2 bg-white text-xs text-charini-charcoal placeholder:text-charini-charcoal-dim/60 border border-charini-border focus:border-charini-charcoal rounded-2xl transition-colors"
                />
              </div>

              {errorMessage && (
                <p className="text-charini-error text-xs text-center py-1 bg-charini-error-bg border border-charini-error/30 rounded-lg">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[46px] mt-1 py-3 px-6 rounded-full bg-charini-charcoal hover:bg-charini-charcoal-deep text-white text-xs font-semibold tracking-[0.16em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_2px_8px_rgba(26,25,24,0.12)] active:scale-[0.99]"
              >
                {isSubmitting ? "Submitting Inquiry..." : "Submit Enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
