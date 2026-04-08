"use client";

import { motion } from "framer-motion";
import { cn, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  format?: "number" | "duration" | "percent";
  tone?: "default" | "positive" | "negative";
};

function renderValue(value: number, format: MetricCardProps["format"]) {
  if (format === "duration") return formatDuration(value);
  if (format === "percent") return formatPercent(value);
  return formatNumber(value);
}

export function MetricCard({
  label,
  value,
  format = "number",
  tone = "default",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4"
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 text-3xl font-light tracking-tight",
          tone === "default" && "text-white",
          tone === "positive" && "text-emerald-300",
          tone === "negative" && "text-rose-300",
        )}
      >
        {renderValue(value, format)}
      </p>
    </motion.div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
      <div className="h-3 w-28 animate-pulse rounded bg-neutral-800" />
      <div className="mt-3 h-8 w-24 animate-pulse rounded bg-neutral-800/80" />
    </div>
  );
}
