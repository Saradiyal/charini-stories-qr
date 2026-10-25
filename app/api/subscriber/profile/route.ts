import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSecretServerClient } from "@/lib/supabase/server";
import { verifyProfileToken } from "@/lib/subscriptions/tokens";

export const dynamic = "force-dynamic";

// In-memory rate limiting map for profile updates (max 15 calls per 10 minutes per client)
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

  if (entry.count >= 15) {
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

    const {
      profileToken,
      firstName,
      lastName,
      country,
      email,
      phoneCountryCode,
      phoneNumber,
    } = body || {};

    // 4. Strict Ownership Verification:
    // Possession of a signed, short-lived profileToken is MANDATORY.
    // Anonymous requests or requests with only an email/phone/subscriberId are rejected with 401.
    const tokenResult = verifyProfileToken(profileToken);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { ok: false, error: "unauthorized", reason: tokenResult.reason },
        { status: 401 }
      );
    }

    const verifiedSubscriberId = tokenResult.subscriberId;

    // 5. Input Sanitization & Boundary Checks
    const cleanEmail =
      typeof email === "string" && email.includes("@")
        ? email.toLowerCase().trim().slice(0, 254)
        : null;
    const cleanFirst =
      typeof firstName === "string" ? firstName.trim().slice(0, 100) : null;
    const cleanLast =
      typeof lastName === "string" ? lastName.trim().slice(0, 100) : null;
    const cleanCountry =
      typeof country === "string" ? country.trim().slice(0, 100) : null;
    const cleanCode =
      typeof phoneCountryCode === "string" ? phoneCountryCode.trim().slice(0, 8) : null;
    const cleanPhone =
      typeof phoneNumber === "string"
        ? phoneNumber.replace(/\D/g, "").replace(/^0+/, "").slice(0, 20)
        : null;

    const supabase = getSecretServerClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
    }

    // 6. Application-Layer Non-Destructive Conflict Guard:
    // Verify that the requested new email or phone number is NOT already registered
    // to a different subscriber. Under NO circumstances do we delete another user's record!
    if (cleanEmail) {
      const { data: emailConflict } = await (supabase.from("subscribers" as any) as any)
        .select("id")
        .eq("email", cleanEmail)
        .neq("id", verifiedSubscriberId)
        .maybeSingle();

      if (emailConflict) {
        return NextResponse.json(
          { ok: false, error: "conflict", reason: "email_already_in_use" },
          { status: 409 }
        );
      }
    }

    if (cleanPhone && cleanCode) {
      const { data: phoneConflict } = await (supabase.from("subscribers" as any) as any)
        .select("id")
        .eq("phone_country_code", cleanCode)
        .eq("phone_number", cleanPhone)
        .neq("id", verifiedSubscriberId)
        .maybeSingle();

      if (phoneConflict) {
        return NextResponse.json(
          { ok: false, error: "conflict", reason: "phone_already_in_use" },
          { status: 409 }
        );
      }
    }

    // 7. Atomic RPC update bound strictly to verifiedSubscriberId
    let { data, error } = await supabase.rpc("update_subscriber_profile", {
      p_subscriber_id: verifiedSubscriberId,
      p_email: cleanEmail,
      p_first_name: cleanFirst,
      p_last_name: cleanLast,
      p_country: cleanCountry,
      p_phone_country_code: cleanCode,
      p_phone_number: cleanPhone,
    });

    // If RPC failed due to signature mismatch (deployed function has 6 params), fallback safely
    if (
      error &&
      (error.code === "PGRST202" ||
        error.message?.includes("function") ||
        error.code === "42883")
    ) {
      const fallback = await supabase.rpc("update_subscriber_profile", {
        p_subscriber_id: verifiedSubscriberId,
        p_email: cleanEmail,
        p_first_name: cleanFirst,
        p_last_name: cleanLast,
        p_phone_country_code: cleanCode,
        p_phone_number: cleanPhone,
      });
      data = fallback.data;
      error = fallback.error;
    }

    // Direct country column update if country provided and table supports it
    if (cleanCountry) {
      try {
        await supabase
          .from("subscribers")
          .update({ country: cleanCountry, updated_at: new Date().toISOString() })
          .eq("id", verifiedSubscriberId);
      } catch (colErr) {
        console.warn("[api/subscriber/profile] Direct country update skipped:", colErr);
      }
    }

    if (error) {
      console.error("[api/subscriber/profile] RPC error:", error);
      return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
    }

    // Check RPC status response (e.g. conflict, not_found, updated)
    if (data && typeof data === "object" && (data as any).status === "conflict") {
      return NextResponse.json(
        { ok: false, error: "conflict", reason: (data as any).reason },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, status: "updated" });
  } catch (err) {
    console.error("[api/subscriber/profile] Unexpected error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
