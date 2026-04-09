import type { DatePreset } from "@/lib/types";

export type DateRange = {
  startDate: string;
  endDate: string;
};

const OVERALL_START_YEAR = 2026;
const OVERALL_START_MONTH_INDEX = 0;
const OVERALL_START_DAY = 1;

export function getPresetRange(preset: DatePreset): DateRange {
  const now = new Date();
  const todayStartLocal = getLocalDayStart(now);
  const todayEndLocal = getLocalDayEnd(now);

  if (preset === "overall") {
    const overallStartLocal = new Date(
      OVERALL_START_YEAR,
      OVERALL_START_MONTH_INDEX,
      OVERALL_START_DAY,
      0,
      0,
      0,
      0,
    );
    return toUtcIsoRange(overallStartLocal, todayEndLocal);
  }

  if (preset === "today") {
    return toUtcIsoRange(todayStartLocal, todayEndLocal);
  }

  if (preset === "yesterday") {
    const yesterday = new Date(todayStartLocal);
    yesterday.setDate(yesterday.getDate() - 1);
    return toUtcIsoRange(getLocalDayStart(yesterday), getLocalDayEnd(yesterday));
  }

  if (preset === "last_7_days") {
    const start = new Date(todayStartLocal);
    start.setDate(start.getDate() - 6);
    return toUtcIsoRange(getLocalDayStart(start), todayEndLocal);
  }

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const thisMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
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
    rawPreset === "overall" ||
    rawPreset === "today" ||
    rawPreset === "yesterday" ||
    rawPreset === "last_7_days" ||
    rawPreset === "this_month" ||
    rawPreset === "custom"
      ? rawPreset
      : "overall";
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

function getLocalDayStart(input: Date) {
  return new Date(
    input.getFullYear(),
    input.getMonth(),
    input.getDate(),
    0,
    0,
    0,
    0,
  );
}

function getLocalDayEnd(input: Date) {
  return new Date(
    input.getFullYear(),
    input.getMonth(),
    input.getDate(),
    23,
    59,
    59,
    999,
  );
}
