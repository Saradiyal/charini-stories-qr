import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="editorial-canvas min-h-screen flex flex-col justify-between py-16 px-6">
      <main className="w-full max-w-[480px] mx-auto flex flex-col items-center text-center">
        <h1 className="font-serif text-2xl sm:text-3xl text-charini-charcoal mb-4">
          Privacy Notice
        </h1>
        <div className="w-8 h-[1px] bg-charini-border my-2" />
        <p className="font-sans text-xs sm:text-sm text-charini-charcoal-muted leading-relaxed mb-6 font-normal">
          [Placeholder] The full CHARINI privacy policy will be published here upon official release.
          We value your privacy and only use your email to deliver the newsletter updates you have
          explicitly requested. You may unsubscribe at any time.
        </p>
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.16em] text-charini-charcoal border-b border-charini-charcoal pb-1 hover:opacity-70 transition-opacity"
        >
          &larr; Return to Newsletter
        </Link>
      </main>

      <footer className="text-center mt-12">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-charini-charcoal-dim/50 font-light">
          CHARINI &bull; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
