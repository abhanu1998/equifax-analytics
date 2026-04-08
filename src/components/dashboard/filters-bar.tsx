"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import type { DatePreset } from "@/lib/types";
import {
  getPresetRange,
  parseDateRangeFromSearchParams,
  toUtcIsoRange,
} from "@/lib/date-range";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const presets: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "this_month", label: "This Month" },
  { id: "custom", label: "Custom" },
];

export function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = useMemo(
    () => parseDateRangeFromSearchParams(new URLSearchParams(searchParams)),
    [searchParams],
  );

  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(current.preset);
  const [customStart, setCustomStart] = useState(
    current.startDate.slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
  );
  const [customEnd, setCustomEnd] = useState(
    current.endDate.slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
  );

  function applyFilters(nextPreset = selectedPreset) {
    const next = new URLSearchParams(searchParams);
    next.set("preset", nextPreset);

    if (nextPreset === "custom") {
      const start = new Date(`${customStart}T00:00:00.000Z`);
      const end = new Date(`${customEnd}T23:59:59.999Z`);
      const range = toUtcIsoRange(start, end);
      next.set("start_date", range.startDate);
      next.set("end_date", range.endDate);
    } else {
      const range = getPresetRange(nextPreset);
      next.set("start_date", range.startDate);
      next.set("end_date", range.endDate);
    }

    next.set("refresh_nonce", getNextRefreshNonce(searchParams));
    router.push(`${pathname}?${next.toString()}`);
  }

  function manualRefresh() {
    const next = new URLSearchParams(searchParams);
    next.set("refresh_nonce", getNextRefreshNonce(searchParams));
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 px-4 py-3">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setSelectedPreset(preset.id);
                if (preset.id !== "custom") {
                  applyFilters(preset.id);
                }
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors",
                selectedPreset === preset.id
                  ? "border-neutral-500 bg-neutral-100 text-neutral-900"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-100",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedPreset === "custom" && (
            <>
              <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
                <Calendar className="size-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="bg-transparent text-neutral-200 outline-none"
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
                <Calendar className="size-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="bg-transparent text-neutral-200 outline-none"
                />
              </label>
            </>
          )}

          <Button variant="secondary" onClick={() => applyFilters()}>
            Apply
          </Button>
          <Button variant="ghost" onClick={manualRefresh} className="gap-2">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

function getNextRefreshNonce(params: { get: (name: string) => string | null }) {
  const current = Number(params.get("refresh_nonce") ?? "0");
  if (!Number.isFinite(current)) {
    return "1";
  }
  return String(Math.trunc(current) + 1);
}
