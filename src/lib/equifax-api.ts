import "server-only";

import {
  EQUIFAX_API_PASSWORD,
  EQUIFAX_API_USERNAME,
  EQUIFAX_BASE_URL,
} from "@/lib/constants";

function buildEquifaxAuthorization() {
  if (!EQUIFAX_API_USERNAME || !EQUIFAX_API_PASSWORD) {
    throw new Error("Upstream API credentials are not configured");
  }

  const token = Buffer.from(
    `${EQUIFAX_API_USERNAME}:${EQUIFAX_API_PASSWORD}`,
  ).toString("base64");

  return `Basic ${token}`;
}

export async function equifaxGet<T>(
  path: string,
  searchParams?: URLSearchParams,
): Promise<T> {
  if (!EQUIFAX_BASE_URL) {
    throw new Error("EQUIFAX_BASE_URL is not configured");
  }

  const base = EQUIFAX_BASE_URL.replace(/\/$/, "");
  const query = searchParams?.toString();
  const url = query ? `${base}${path}?${query}` : `${base}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: buildEquifaxAuthorization(),
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("Upstream request timeout");
    }
    throw new Error("Upstream request failed");
  }

  if (!response.ok) {
    throw new Error(`Upstream API error (${response.status})`);
  }

  return (await response.json()) as T;
}

export function pickDateQuery(searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams();

  for (const key of ["start_date", "end_date", "session_id", "limit", "offset"]) {
    const value = searchParams.get(key);
    if (value) {
      nextParams.set(key, value);
    }
  }

  return nextParams;
}
