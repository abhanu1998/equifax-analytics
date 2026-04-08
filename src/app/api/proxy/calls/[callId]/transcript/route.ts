import { NextRequest, NextResponse } from "next/server";
import { ensureRouteSession } from "@/lib/route-auth";
import { equifaxGet } from "@/lib/equifax-api";
import type { TranscriptResponse } from "@/lib/types";

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
    const data = await equifaxGet<TranscriptResponse>(
      `/api/calls/${safeCallId}/transcript`,
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch transcript right now" },
      { status: 502 },
    );
  }
}
