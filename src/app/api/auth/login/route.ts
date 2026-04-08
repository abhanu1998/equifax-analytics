import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, attachSessionCookie } from "@/lib/auth";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } from "@/lib/constants";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 12;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

function incrementAttempt(request: Request) {
  const key = getClientKey(request);
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return;
  }

  attempts.set(key, { ...entry, count: entry.count + 1 });
}

function isRateLimited(request: Request) {
  const key = getClientKey(request);
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function clearAttempts(request: Request) {
  attempts.delete(getClientKey(request));
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 },
    );
  }

  try {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !process.env.APP_JWT_SECRET) {
      return NextResponse.json(
        { error: "Auth configuration missing on server" },
        { status: 500 },
      );
    }

    const payload = bodySchema.parse(await request.json());
    const username = payload.username.trim();
    const password = payload.password;

    const isUsernameAllowed =
      username === ADMIN_USERNAME || (!!ADMIN_EMAIL && username === ADMIN_EMAIL);
    const isValid = isUsernameAllowed && password === ADMIN_PASSWORD;

    if (!isValid) {
      incrementAttempt(request);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      sub: "equifax-admin",
      username: ADMIN_USERNAME,
      role: "admin",
      scope: "dashboard",
    });

    const response = NextResponse.json({
      ok: true,
      user: { username: ADMIN_USERNAME, role: "admin" },
    });
    attachSessionCookie(response, token);
    clearAttempts(request);

    return response;
  } catch {
    incrementAttempt(request);
    return NextResponse.json(
      { error: "Invalid login request" },
      { status: 400 },
    );
  }
}
