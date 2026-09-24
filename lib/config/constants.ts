import { PreferenceOption } from "../types";

/**
 * CHARINI Stories Brand & Link Configuration
 *
 * NOTE: Replace the placeholder URLs below with the brand's verified
 * production channels when deploying.
 */
export const BRAND_LINKS = {
  // Official Instagram profile
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/charini.stories/",

  // Official website URL
  website: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://charini-resortwear.vercel.app/stories",

  // Official WhatsApp link
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/94778178799",

  // Official contact phone / dialer
  contact: process.env.NEXT_PUBLIC_CONTACT_URL || "tel:+94778178799",

  // Direct phone display
  phoneDisplay: "+94 77 817 8799",

  // Boutique Store Location
  location: "Shop 36, Level 2, One Galle Face",
};

/**
 * Newsletter update categories as specified by CHARINI Stories.
 */
export const NEWSLETTER_PREFERENCES: PreferenceOption[] = [
  {
    id: "new_prints",
    label: "New Prints",
  },
  {
    id: "new_cuts",
    label: "New Cuts & Styles",
  },
  {
    id: "new_collections",
    label: "New Collections",
  },
  {
    id: "limited_drops",
    label: "Limited Drops",
  },
  {
    id: "promotions",
    label: "Promotions & Offers",
  },
  {
    id: "events",
    label: "Events & Store Updates",
  },
];

/**
 * Default fallback source when no ?source= query parameter is present in URL
 */
export const DEFAULT_SOURCE = "direct";

/**
 * Official copy guidelines
 */
export const COPY = {
  tagline: "Discover CHARINI Stories.",
  newsletterHeading: "Stay in the loop.",
  newsletterSubtitle: "Be the first to hear about new prints, new cuts, collections and special releases.",
  preferencesHeading: "What would you like to hear about?",
  emailPlaceholder: "Enter your email address",
  submitButton: "Keep Me Updated",
  submitButtonLoading: "Updating...",
  privacyNotice: "By subscribing, you agree to receive the updates you’ve selected. You can unsubscribe at any time.",
  successMessage: "You’re in. We’ll only send you the updates you choose.",
  existingSubscriberMessage: "You’re already subscribed — your preferences have been updated.",
  errors: {
    invalidEmail: "Please enter a valid email address.",
    noInterests: "Please choose at least one type of update.",
    serverError: "Something went wrong. Please try again.",
  },
};
