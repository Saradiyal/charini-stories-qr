import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// In-memory rate limiting map for profile updates (max 20 calls per 10 minutes per IP)
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
    rateLimitMap.set(key, { count: 1, resetAt: now + 600000 }); // 10 minutes
    return true;
  }

  if (entry.count >= 20) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Payload size guard (max 8KB)
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    // 2. Rate limiting check
    if (!checkRateLimit(req)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    // 3. Safe JSON parse
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const { subscriberId, email, firstName, lastName, country, phoneCountryCode, phoneNumber } = body || {};

    const cleanEmail =
      typeof email === "string" && email.includes("@") ? email.toLowerCase().trim().slice(0, 254) : null;
    const cleanFirst = typeof firstName === "string" ? firstName.trim().slice(0, 100) : null;
    const cleanLast = typeof lastName === "string" ? lastName.trim().slice(0, 100) : null;
    const cleanCountry = typeof country === "string" ? country.trim().slice(0, 100) : null;
    const cleanCode = typeof phoneCountryCode === "string" ? phoneCountryCode.trim().slice(0, 8) : null;
    const cleanPhone =
      typeof phoneNumber === "string" ? phoneNumber.replace(/\D/g, "").replace(/^0+/, "").slice(0, 20) : null;
    const cleanId =
      typeof subscriberId === "string" && /^[0-9a-fA-F-]{36}$/.test(subscriberId) ? subscriberId : null;

    if (!cleanId && !cleanEmail && !cleanPhone) {
      return NextResponse.json({ ok: false, error: "identifier_required" }, { status: 400 });
    }

    const supabase = getSecretServerClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
    }

    // Attempt RPC with country parameter first
    let { data, error } = await supabase.rpc("update_subscriber_profile", {
      p_subscriber_id: cleanId,
      p_email: cleanEmail,
      p_first_name: cleanFirst,
      p_last_name: cleanLast,
      p_country: cleanCountry,
      p_phone_country_code: cleanCode,
      p_phone_number: cleanPhone,
    });

    // If RPC failed due to signature mismatch (before migration is applied), fall back to standard signature
    if (error && (error.code === "PGRST202" || error.message?.includes("function") || error.code === "42883")) {
      const fallback = await supabase.rpc("update_subscriber_profile", {
        p_subscriber_id: cleanId,
        p_email: cleanEmail,
        p_first_name: cleanFirst,
        p_last_name: cleanLast,
        p_phone_country_code: cleanCode,
        p_phone_number: cleanPhone,
      });
      data = fallback.data;
      error = fallback.error;
    }

    // If country is provided and we have subscriberId, also attempt direct update on table
    if (cleanCountry && cleanId) {
      try {
        await supabase
          .from("subscribers")
          .update({ country: cleanCountry, updated_at: new Date().toISOString() })
          .eq("id", cleanId);
      } catch (colErr) {
        // Table column might not exist yet if migration has not been applied; do not break UX
        console.warn("[api/subscriber/profile] Direct country update skipped:", colErr);
      }
    }

    if (error) {
      console.error("[api/subscriber/profile] RPC error:", error);
      return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[api/subscriber/profile] Unexpected error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
