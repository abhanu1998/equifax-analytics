import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(totalSeconds?: number) {
  if (!totalSeconds || Number.isNaN(totalSeconds)) {
    return "0s";
  }

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;
  return `${hours}h ${remainderMinutes}m`;
}

export function formatNumber(value?: number) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatPercent(value?: number) {
  return `${(value ?? 0).toFixed(1)}%`;
}

export function safeNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
