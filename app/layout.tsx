import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHARINI — Stay in the loop",
  description:
    "Be the first to hear about new prints, new cuts, collections and special releases from CHARINI.",
  keywords: ["CHARINI", "Fashion", "Designer", "Prints", "Cuts", "Collections"],
  authors: [{ name: "CHARINI" }],
  openGraph: {
    title: "CHARINI — Stay in the loop",
    description:
      "Be the first to hear about new prints, new cuts, collections and special releases from CHARINI.",
    type: "website",
    siteName: "CHARINI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
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
    <html lang="en" className="bg-charini-bg text-charini-charcoal">
      <body className="min-h-screen bg-charini-bg font-sans antialiased selection:bg-charini-charcoal selection:text-charini-bg">
        {children}
      </body>
    </html>
  );
}
