import { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 md:p-5 ${className ?? ""}`}
    >
      <header className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-sm text-white">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function ChartCardSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4">
      <p className="text-sm text-neutral-300">{title}</p>
      <div className="mt-4 h-56 animate-pulse rounded-xl bg-neutral-800/70" />
    </section>
  );
}
