import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { validateSubscription } from "@/lib/subscriptions/validation";
import { subscribe } from "@/lib/subscriptions/service";
import type { SubscribeResponse } from "@/lib/subscriptions/contract";
import { LIMITS } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Derives a privacy-preserving rate-limiting key for the client.
 * Uses HMAC-SHA256 with the server secret so raw IP addresses are never
 * logged, stored in plaintext, or reversible by database readers.
 */
function deriveRateKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const secret = process.env.SUPABASE_SECRET_KEY || "charini-rate-salt";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    // 1. Payload size protection
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > LIMITS.requestBodyBytes) {
      return NextResponse.json(
        { ok: false, code: "invalid_request" },
        { status: 413 },
      );
    }

    // 2. Parse JSON safely
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, code: "invalid_request" },
        { status: 400 },
      );
    }

    // 3. Server-side validation
    const validation = validateSubscription(rawBody);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, code: validation.code, field: validation.field },
        { status: 400 },
      );
    }

    // 4. Execute atomic subscription transaction
    const rateKey = deriveRateKey(req);
    const result = await subscribe(validation.data, rateKey);

    if (!result.ok) {
      if (result.code === "rate_limited") {
        return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
      }
      if (result.code === "already_subscribed") {
        return NextResponse.json(
          { ok: false, code: "already_subscribed", field: "email" },
          { status: 409 },
        );
      }
      if (result.code === "unavailable") {
        return NextResponse.json({ ok: false, code: "unavailable" }, { status: 503 });
      }
      return NextResponse.json({ ok: false, code: result.code }, { status: 400 });
    }

    return NextResponse.json({ ok: true, subscriberId: result.subscriberId });
  } catch (err) {
    console.error("[api/subscribe] Unexpected error:", err);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}
