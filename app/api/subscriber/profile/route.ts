import { NextRequest, NextResponse } from "next/server";
import { getSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriberId, email, firstName, lastName, phoneCountryCode, phoneNumber } = body || {};

    const cleanEmail =
      typeof email === "string" && email.includes("@") ? email.toLowerCase().trim() : null;
    const cleanFirst = typeof firstName === "string" ? firstName.trim().slice(0, 100) : null;
    const cleanLast = typeof lastName === "string" ? lastName.trim().slice(0, 100) : null;
    const cleanCode = typeof phoneCountryCode === "string" ? phoneCountryCode.trim().slice(0, 8) : null;
    const cleanPhone =
      typeof phoneNumber === "string" ? phoneNumber.replace(/\D/g, "").slice(0, 20) : null;
    const cleanId = typeof subscriberId === "string" && subscriberId.length > 10 ? subscriberId : null;

    if (!cleanId && !cleanEmail && !cleanPhone) {
      return NextResponse.json({ ok: false, error: "identifier_required" }, { status: 400 });
    }

    const supabase = getSecretServerClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
    }

    const { data, error } = await supabase.rpc("update_subscriber_profile", {
      p_subscriber_id: cleanId,
      p_email: cleanEmail,
      p_first_name: cleanFirst,
      p_last_name: cleanLast,
      p_phone_country_code: cleanCode,
      p_phone_number: cleanPhone,
    });

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
