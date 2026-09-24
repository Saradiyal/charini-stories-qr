import { NextRequest, NextResponse } from "next/server";
import { validateNewsletterSubmission } from "@/lib/validation/newsletter";
import { saveSubscriber } from "@/lib/supabase/server";
import { COPY } from "@/lib/config/constants";

// Basic in-memory rate-limiter: max 10 requests per minute per IP
const ipRequests = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 15;

  const record = ipRequests.get(ip);
  if (!record || now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: COPY.errors.invalidEmail,
        },
        { status: 400 }
      );
    }

    // Server-side validation
    const validation = validateNewsletterSubmission(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error || COPY.errors.invalidEmail,
        },
        { status: 400 }
      );
    }

    // Save or update subscriber
    const result = await saveSubscriber(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || COPY.errors.serverError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isExistingSubscriber: result.isExistingSubscriber ?? false,
      message: result.message,
    });
  } catch (error) {
    console.error("API /api/newsletter error:", error);
    return NextResponse.json(
      {
        success: false,
        message: COPY.errors.serverError,
      },
      { status: 500 }
    );
  }
}
