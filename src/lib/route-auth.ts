import { NextRequest } from "next/server";
import { getSessionFromNextRequest } from "@/lib/auth";

export async function ensureRouteSession(request: NextRequest) {
  const session = await getSessionFromNextRequest(request);
  return session;
}
