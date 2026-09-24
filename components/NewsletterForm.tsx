"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import InterestSelector from "./InterestSelector";
import { NewsletterPreference, NewsletterApiResponse } from "@/lib/types";
import { COPY } from "@/lib/config/constants";

interface NewsletterFormProps {
  source?: string;
}

export default function NewsletterForm({ source = "direct" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<NewsletterPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    isExisting: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick validations
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(COPY.errors.invalidEmail);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage(COPY.errors.invalidEmail);
      return;
    }

    if (selectedInterests.length === 0) {
      setErrorMessage(COPY.errors.noInterests);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          preferences: selectedInterests,
          source: source || "direct",
        }),
      });

      const data: NewsletterApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || COPY.errors.serverError);
        return;
      }

      setSuccessInfo({
        message: data.message || COPY.successMessage,
        isExisting: !!data.isExistingSubscriber,
      });
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage(COPY.errors.serverError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessInfo(null);
    setErrorMessage(null);
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="w-full pt-8 pb-10"
    >
      <div className="relative rounded-sm bg-brand-surface/90 border border-brand-border p-6 sm:p-7 md:p-8">
        {/* Subtle decorative divider line at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

        <AnimatePresence mode="wait">
          {successInfo ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="py-4 text-center flex flex-col items-center"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/40 text-brand-gold mb-4">
                <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
              </div>

              <h3 className="font-serif text-2xl sm:text-[26px] text-brand-cream font-light tracking-wide mb-2">
                {successInfo.isExisting ? "Preferences Updated" : "Welcome"}
              </h3>

              <p className="text-sm font-sans text-brand-text-muted max-w-xs leading-relaxed mb-6">
                {successInfo.message}
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-sans uppercase tracking-[0.16em] text-brand-gold hover:text-brand-gold-light border-b border-brand-gold/30 hover:border-brand-gold pb-0.5 transition-colors duration-200"
              >
                Update preferences again
              </button>
            </motion.div>
          ) : (
            /* Form State */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Heading & Subtitle */}
              <div className="text-center mb-6 sm:mb-7">
                <h2
                  id="newsletter-heading"
                  className="font-serif text-2xl sm:text-[28px] text-brand-cream font-normal tracking-wide"
                >
                  {COPY.newsletterHeading}
                </h2>
                <p className="mt-2 text-[12.5px] sm:text-xs text-brand-text-muted leading-relaxed font-sans max-w-sm mx-auto">
                  {COPY.newsletterSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="newsletter-email"
                    className="block text-xs font-sans uppercase tracking-widest text-brand-text-dim mb-2 font-medium"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="newsletter-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder={COPY.emailPlaceholder}
                      disabled={isLoading}
                      required
                      aria-invalid={errorMessage ? "true" : "false"}
                      aria-describedby={errorMessage ? "newsletter-error" : undefined}
                      className="w-full px-4 py-3.5 rounded-sm bg-brand-bg/80 border border-brand-border-subtle focus:border-brand-gold text-brand-text placeholder:text-brand-text-dim/60 text-sm font-sans transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-brand-gold/40"
                    />
                  </div>
                </div>

                {/* Preference Selection */}
                <div>
                  <span className="block text-xs font-sans uppercase tracking-widest text-brand-text-dim mb-2.5 font-medium">
                    {COPY.preferencesHeading}
                  </span>
                  <InterestSelector
                    selected={selectedInterests}
                    onChange={(updated) => {
                      setSelectedInterests(updated);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={isLoading}
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="newsletter-error"
                    role="alert"
                    aria-live="polite"
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm bg-red-950/30 border border-red-800/40 text-red-200 text-xs font-sans"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full flex items-center justify-center px-6 py-4 rounded-sm bg-brand-gold hover:bg-brand-gold-light active:scale-[0.99] text-brand-bg font-sans font-medium text-xs sm:text-sm uppercase tracking-[0.16em] transition-all duration-200 shadow-[0_2px_12px_rgba(227,192,128,0.18)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{COPY.submitButtonLoading}</span>
                      </span>
                    ) : (
                      <span>{COPY.submitButton}</span>
                    )}
                  </button>

                  {/* Privacy / Consent Notice */}
                  <p className="mt-3 text-center text-[11px] sm:text-[11.5px] font-sans text-brand-text-dim/80 leading-normal max-w-xs mx-auto">
                    {COPY.privacyNotice}
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
