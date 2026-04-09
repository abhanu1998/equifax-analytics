"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPresetRange, toUtcIsoRange } from "@/lib/date-range";
import type { DatePreset } from "@/lib/types";

const STORAGE_KEY = "equifax-dashboard-filters-v1";
const UPDATE_EVENT = "equifax-dashboard-filters-updated";

export type DashboardFilterState = {
  preset: DatePreset;
  startDate: string;
  endDate: string;
  refreshNonce: number;
};

type ApplyFilterOptions = {
  customStartDate?: string;
  customEndDate?: string;
};

export function useDashboardFilters() {
  const [state, setState] = useState<DashboardFilterState>(readFilterState);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      setState(readFilterState());
    }

    function handleCustomUpdate() {
      setState(readFilterState());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(UPDATE_EVENT, handleCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(UPDATE_EVENT, handleCustomUpdate);
    };
  }, []);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("start_date", state.startDate);
    params.set("end_date", state.endDate);
    params.set("refresh_nonce", String(state.refreshNonce));
    return params;
  }, [state.endDate, state.refreshNonce, state.startDate]);

  const applyPreset = useCallback(
    (preset: DatePreset, options?: ApplyFilterOptions) => {
      const nextState =
        preset === "custom"
          ? createCustomFilterState(
              options?.customStartDate,
              options?.customEndDate,
              state.refreshNonce + 1,
            )
          : createPresetFilterState(preset, state.refreshNonce + 1);
      writeFilterState(nextState);
      setState(nextState);
      window.dispatchEvent(new Event(UPDATE_EVENT));
    },
    [state.refreshNonce],
  );

  const manualRefresh = useCallback(() => {
    const nextState = {
      ...state,
      refreshNonce: state.refreshNonce + 1,
    };
    writeFilterState(nextState);
    setState(nextState);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }, [state]);

  return {
    state,
    queryParams,
    applyPreset,
    manualRefresh,
  };
}

function getDefaultFilterState(): DashboardFilterState {
  return createPresetFilterState("overall", 1);
}

function createPresetFilterState(
  preset: Exclude<DatePreset, "custom">,
  refreshNonce: number,
): DashboardFilterState {
  const range = getPresetRange(preset);
  return {
    preset,
    startDate: range.startDate,
    endDate: range.endDate,
    refreshNonce,
  };
}

function createCustomFilterState(
  customStartDate?: string,
  customEndDate?: string,
  refreshNonce = 1,
): DashboardFilterState {
  const fallback = getDefaultFilterState();
  if (!customStartDate || !customEndDate) {
    return {
      ...fallback,
      refreshNonce,
    };
  }

  const start = new Date(`${customStartDate}T00:00:00.000`);
  const end = new Date(`${customEndDate}T23:59:59.999`);
  const range = toUtcIsoRange(start, end);
  return {
    preset: "custom",
    startDate: range.startDate,
    endDate: range.endDate,
    refreshNonce,
  };
}

function readFilterState(): DashboardFilterState {
  if (typeof window === "undefined") {
    return getDefaultFilterState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultFilterState();
    }

    const parsed = JSON.parse(raw) as Partial<DashboardFilterState>;
    if (
      parsed.preset === "custom" &&
      parsed.startDate &&
      parsed.endDate &&
      isValidDate(parsed.startDate) &&
      isValidDate(parsed.endDate)
    ) {
      return {
        preset: "custom",
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        refreshNonce: toSafeNonce(parsed.refreshNonce),
      };
    }

    const preset = toPreset(parsed.preset);
    return createPresetFilterState(preset, toSafeNonce(parsed.refreshNonce));
  } catch {
    return getDefaultFilterState();
  }
}

function writeFilterState(state: DashboardFilterState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toPreset(value: unknown): Exclude<DatePreset, "custom"> {
  if (
    value === "overall" ||
    value === "today" ||
    value === "yesterday" ||
    value === "last_7_days" ||
    value === "this_month"
  ) {
    return value;
  }
  return "overall";
}

function toSafeNonce(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.trunc(parsed);
}

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}
