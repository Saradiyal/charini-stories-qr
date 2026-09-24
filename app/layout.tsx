import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHARINI Stories | Connect & Updates",
  description:
    "Discover CHARINI Stories. Connect with our boutique channels and stay updated on new prints, cuts, collections, and releases.",
  keywords: [
    "CHARINI Stories",
    "CHARINI",
    "Fashion",
    "Boutique",
    "Designer",
    "Prints",
    "Collections",
  ],
  authors: [{ name: "CHARINI Stories" }],
  openGraph: {
    title: "CHARINI Stories | Connect & Updates",
    description: "Discover CHARINI Stories. Connect with our boutique channels.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#033431",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-brand-neutral-bg text-brand-dark">
      <body className="min-h-screen bg-brand-neutral-bg text-brand-dark font-sans antialiased selection:bg-brand-green selection:text-brand-neutral-bg">
        {children}
      </body>
    </html>
  );
}
