import crypto from "crypto";

const PROFILE_TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutes

function getSigningSecret(): string {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "[tokens] Critical Security Error: SUPABASE_SECRET_KEY is not configured with adequate entropy."
    );
  }
  return secret.trim();
}

/**
 * Constant-time comparison using SHA-256 digests to prevent timing leaks.
 */
function timingSafeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export interface ProfileTokenPayload {
  sub: string; // subscriber UUID
  iat: number;
  exp: number;
  act: "profile_access";
}

/**
 * Generates a short-lived, cryptographically signed profile access token.
 * Issued only after a successful subscription event.
 */
export function createProfileToken(subscriberId: string): string {
  if (!subscriberId || !/^[0-9a-fA-F-]{36}$/.test(subscriberId)) {
    throw new Error("Invalid subscriberId for token generation.");
  }

  const payload: ProfileTokenPayload = {
    sub: subscriberId,
    iat: Date.now(),
    exp: Date.now() + PROFILE_TOKEN_TTL_MS,
    act: "profile_access",
  };

  const b64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(b64Payload)
    .digest("base64url");

  return `${b64Payload}.${signature}`;
}

/**
 * Verifies a profile access token.
 * Ensures the token was signed with the server secret, has not expired,
 * and matches the profile access action.
 */
export function verifyProfileToken(
  token: string | null | undefined
): { valid: true; subscriberId: string } | { valid: false; reason: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed_token" };
  }

  const [b64Payload, signature] = parts;

  try {
    const expectedSig = crypto
      .createHmac("sha256", getSigningSecret())
      .update(b64Payload)
      .digest("base64url");

    if (!timingSafeCompare(signature, expectedSig)) {
      return { valid: false, reason: "invalid_signature" };
    }

    const payload: ProfileTokenPayload = JSON.parse(
      Buffer.from(b64Payload, "base64url").toString("utf8")
    );

    if (payload.act !== "profile_access") {
      return { valid: false, reason: "invalid_token_action" };
    }

    if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return { valid: false, reason: "expired_token" };
    }

    if (!payload.sub || !/^[0-9a-fA-F-]{36}$/.test(payload.sub)) {
      return { valid: false, reason: "invalid_subscriber_id" };
    }

    return { valid: true, subscriberId: payload.sub };
  } catch {
    return { valid: false, reason: "verification_exception" };
  }
}
