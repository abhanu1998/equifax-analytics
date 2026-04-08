import { cn } from "@/lib/utils";

type StatusPillProps = {
  text: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
};

export function StatusPill({ text, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]",
        tone === "neutral" && "border-neutral-700 bg-neutral-800/60 text-neutral-300",
        tone === "positive" && "border-emerald-800/70 bg-emerald-500/15 text-emerald-300",
        tone === "negative" && "border-rose-800/70 bg-rose-500/15 text-rose-300",
        tone === "warning" && "border-amber-800/70 bg-amber-500/15 text-amber-300",
      )}
    >
      {text}
    </span>
  );
}
