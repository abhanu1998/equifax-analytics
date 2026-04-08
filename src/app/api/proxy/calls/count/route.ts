import { NextRequest, NextResponse } from "next/server";
import { ensureRouteSession } from "@/lib/route-auth";
import { equifaxGet, pickDateQuery } from "@/lib/equifax-api";

export async function GET(request: NextRequest) {
  const session = await ensureRouteSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const query = pickDateQuery(request.nextUrl.searchParams);
    const data = await equifaxGet<{ count: number }>("/api/calls/count", query);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch call count right now" },
      { status: 502 },
    );
  }
}
