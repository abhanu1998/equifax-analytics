import { NextRequest, NextResponse } from "next/server";
import { ensureRouteSession } from "@/lib/route-auth";
import { equifaxGet, pickDateQuery } from "@/lib/equifax-api";
import type { CallRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  const session = await ensureRouteSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const query = pickDateQuery(request.nextUrl.searchParams);
    if (!query.has("limit")) {
      query.set("limit", "25");
    }
    if (!query.has("offset")) {
      query.set("offset", "0");
    }

    const data = await equifaxGet<CallRecord[]>("/api/calls", query);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch call logs right now" },
      { status: 502 },
    );
  }
}
