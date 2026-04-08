import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromNextRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username,
      role: session.role,
    },
  });
}
