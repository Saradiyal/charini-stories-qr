import { NextResponse } from "next/server";
import { getSecretServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessName,
      contactName,
      email,
      phoneCountryCode,
      phoneNumber,
      city,
      country,
      inquiryType,
      message,
      source,
    } = body;

    if (!businessName?.trim() || !contactName?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Business name and contact name are required." },
        { status: 400 }
      );
    }

    if (!email?.trim() && !phoneNumber?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Please provide an email or phone number." },
        { status: 400 }
      );
    }

    const supabase = getSecretServerClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("retail_inquiries").insert({
      business_name: businessName.trim(),
      contact_name: contactName.trim(),
      email: email?.trim() ? email.trim().toLowerCase() : null,
      phone_country_code: phoneCountryCode?.trim() || "+91",
      phone_number: phoneNumber?.trim() ? phoneNumber.replace(/\D/g, "") : null,
      city: city?.trim() || null,
      country: country?.trim() || null,
      inquiry_type: inquiryType?.trim() || "stockist_wholesale",
      message: message?.trim() || null,
      source: source?.trim() || "Mumbai Pop-up",
    });

    if (error) {
      console.error("[retail-inquiry] Insert error:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to submit inquiry." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[retail-inquiry] Exception:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
