import { NextRequest, NextResponse } from "next/server";
import { ensureRouteSession } from "@/lib/route-auth";
import { equifaxGet, pickDateQuery } from "@/lib/equifax-api";
import type { AnalyticsResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const session = await ensureRouteSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const query = pickDateQuery(request.nextUrl.searchParams);
    const data = await equifaxGet<AnalyticsResponse>("/api/calls/analytics", query);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch analytics data right now" },
      { status: 502 },
    );
  }
}
