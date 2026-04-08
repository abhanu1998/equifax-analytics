import type { DatePreset } from "@/lib/types";

export type DateRange = {
  startDate: string;
  endDate: string;
};

export function getPresetRange(preset: DatePreset): DateRange {
  const now = new Date();
  const todayStartUtc = getUtcDayStart(now);
  const todayEndUtc = getUtcDayEnd(now);

  if (preset === "today") {
    return toUtcIsoRange(todayStartUtc, todayEndUtc);
  }

  if (preset === "yesterday") {
    const yesterday = new Date(todayStartUtc);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return toUtcIsoRange(getUtcDayStart(yesterday), getUtcDayEnd(yesterday));
  }

  if (preset === "last_7_days") {
    const start = new Date(todayStartUtc);
    start.setUTCDate(start.getUTCDate() - 6);
    return toUtcIsoRange(getUtcDayStart(start), todayEndUtc);
  }

  const thisMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const thisMonthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
  return toUtcIsoRange(thisMonthStart, thisMonthEnd);
}

export function toUtcIsoRange(start: Date, end: Date): DateRange {
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function parseDateRangeFromSearchParams(
  searchParams: URLSearchParams,
) {
  const rawPreset = searchParams.get("preset");
  const preset: DatePreset =
    rawPreset === "today" ||
    rawPreset === "yesterday" ||
    rawPreset === "last_7_days" ||
    rawPreset === "this_month" ||
    rawPreset === "custom"
      ? rawPreset
      : "today";
  const startDateParam = searchParams.get("start_date");
  const endDateParam = searchParams.get("end_date");

  if (preset !== "custom" || !startDateParam || !endDateParam) {
    const range = getPresetRange(preset);
    return {
      preset,
      startDate: range.startDate,
      endDate: range.endDate,
    };
  }

  return {
    preset,
    startDate: startDateParam,
    endDate: endDateParam,
  };
}

export function withResolvedDateRange(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams.toString());
  const parsed = parseDateRangeFromSearchParams(next);
  next.set("preset", parsed.preset);
  next.set("start_date", parsed.startDate);
  next.set("end_date", parsed.endDate);
  return next;
}

function getUtcDayStart(input: Date) {
  return new Date(
    Date.UTC(
      input.getUTCFullYear(),
      input.getUTCMonth(),
      input.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function getUtcDayEnd(input: Date) {
  return new Date(
    Date.UTC(
      input.getUTCFullYear(),
      input.getUTCMonth(),
      input.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}
