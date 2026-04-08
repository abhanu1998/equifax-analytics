import { NextRequest, NextResponse } from "next/server";
import { ensureRouteSession } from "@/lib/route-auth";
import { equifaxGet } from "@/lib/equifax-api";

type RouteContext = {
  params: Promise<{ callId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await ensureRouteSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { callId } = await context.params;
  if (!callId || callId.includes("/")) {
    return NextResponse.json({ error: "Invalid call id" }, { status: 400 });
  }
  const safeCallId = encodeURIComponent(callId);

  try {
    const query = new URLSearchParams();
    const expiresIn = request.nextUrl.searchParams.get("expires_in");
    if (expiresIn) {
      const parsed = Number(expiresIn);
      if (!Number.isFinite(parsed) || parsed < 60 || parsed > 86400) {
        return NextResponse.json(
          { error: "expires_in must be between 60 and 86400 seconds" },
          { status: 400 },
        );
      }
      query.set("expires_in", String(Math.floor(parsed)));
    }

    const data = await equifaxGet<{ url: string; expires_in: number }>(
      `/api/calls/${safeCallId}/recording-url`,
      query,
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch recording URL right now" },
      { status: 502 },
    );
  }
}
