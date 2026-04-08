import { NextRequest, NextResponse } from "next/server";
import { ensureRouteSession } from "@/lib/route-auth";
import { equifaxGet } from "@/lib/equifax-api";
import type { CallDetailResponse } from "@/lib/types";

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
    const data = await equifaxGet<CallDetailResponse>(
      `/api/calls/${safeCallId}/detail`,
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch call detail right now" },
      { status: 502 },
    );
  }
}
