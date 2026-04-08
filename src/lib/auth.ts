import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/constants";
import type { SessionPayload } from "@/lib/types";

function getSessionSecret() {
  const secret = process.env.APP_JWT_SECRET;
  if (!secret) {
    throw new Error("APP_JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function isSecureCookieEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureCookieEnvironment(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isSecureCookieEnvironment(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromNextRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
