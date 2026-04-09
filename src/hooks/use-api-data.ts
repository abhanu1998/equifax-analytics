"use client";

import { useEffect, useMemo, useState } from "react";

type UseApiDataResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

export function useApiData<T>(
  endpoint: string,
  params: URLSearchParams,
  minDelayMs = 1200,
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => params.toString(), [params]);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${endpoint}?${queryKey}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const payload = (await response.json()) as T;
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, minDelayMs - elapsed);

        await new Promise((resolve) => setTimeout(resolve, remaining));
        if (!cancelled) {
          setData(payload);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unexpected error while fetching data",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [endpoint, queryKey, minDelayMs]);

  return { data, isLoading, error };
}
