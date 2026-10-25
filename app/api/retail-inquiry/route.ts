import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16384; // 16 KB strict limit
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const secret = process.env.SUPABASE_SECRET_KEY || "charini-rate-salt";
  const key = crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 24);

  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 minutes
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

const ALLOWED_INQUIRY_TYPES = new Set([
  "stockist_wholesale",
  "curation_consignment",
  "press_editorial",
  "general_inquiry",
]);

export async function POST(req: NextRequest) {
  try {
    // 1. Content-Length header guard
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    // 2. Rate limiting check
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { ok: false, error: "Too many inquiries. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Read body with raw size enforcement (does not trust header alone)
    const rawText = await req.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    // 4. Safe JSON parse
    let body: any;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON format." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
    }

    // 5. Bot & Honeypot detection
    if (
      body.botTrap ||
      body.website ||
      body.company_url ||
      body.confirm_email
    ) {
      // Silently accept honeypot hits to sinkhole bots without leaking detection
      return NextResponse.json({ ok: true });
    }

    // 6. Schema extraction & field length boundaries
    const businessName = String(body.businessName || body.organization || "").trim().slice(0, 100);
    const contactName = String(body.contactName || body.fullName || "").trim().slice(0, 100);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : null;
    const phoneCountryCode = typeof body.phoneCountryCode === "string" ? body.phoneCountryCode.trim().slice(0, 8) : "+91";
    const rawPhone = String(body.phoneNumber || body.phone || "").trim().slice(0, 30);
    const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, "").slice(0, 20) : null;

    const city = typeof body.city === "string" ? body.city.trim().slice(0, 100) : null;
    const country = typeof body.country === "string" ? body.country.trim().slice(0, 100) : null;
    const location = typeof body.location === "string" ? body.location.trim().slice(0, 100) : null;
    const cleanLocationCity = city || location || null;

    const rawInquiryType = String(body.inquiryType || "stockist_wholesale").trim();
    const cleanInquiryType = ALLOWED_INQUIRY_TYPES.has(rawInquiryType)
      ? rawInquiryType
      : "stockist_wholesale";

    const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : null;
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 100) : "Mumbai Pop-up";

    // Required field validation
    if (!businessName || !contactName) {
      return NextResponse.json(
        { ok: false, error: "Business name and contact name are required." },
        { status: 400 }
      );
    }

    if (!email && !cleanPhone) {
      return NextResponse.json(
        { ok: false, error: "Please provide an email or phone number." },
        { status: 400 }
      );
    }

    if (email && (!email.includes("@") || !email.includes("."))) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const supabase = getSecretServerClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }

    const { error } = await (supabase.from("retail_inquiries" as any) as any).insert({
      business_name: businessName,
      contact_name: contactName,
      email: email || null,
      phone_country_code: phoneCountryCode,
      phone_number: cleanPhone || null,
      city: cleanLocationCity,
      country: country || null,
      inquiry_type: cleanInquiryType,
      message: message || null,
      source: source || "Mumbai Pop-up",
    });

    if (error) {
      console.error("[retail-inquiry] Database insert error:", error.code);
      return NextResponse.json(
        { ok: false, error: "Failed to submit inquiry. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[retail-inquiry] Unexpected handler error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
