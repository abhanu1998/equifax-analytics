import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { FiltersBar } from "@/components/dashboard/filters-bar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#06080f] text-neutral-100">
      <DashboardSidebar />
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex items-center gap-2 border-b border-neutral-800/70 bg-neutral-950 px-4 py-3 lg:hidden">
          <Link
            href="/overview"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
          >
            Overview
          </Link>
          <Link
            href="/call-logs"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
          >
            Call Logs
          </Link>
          <Link
            href="/unidentified-intents"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
          >
            Undefined Intents
          </Link>
          <form action="/api/auth/logout" method="post" className="ml-auto">
            <button
              type="submit"
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
            >
              Logout
            </button>
          </form>
        </div>
        <header className="border-b border-neutral-800/80 bg-neutral-950/60 px-5 py-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Welcome Bot
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-white">
                {title}
              </h1>
              <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
            </div>
          </div>
          <div className="mt-4">
            <Suspense
              fallback={
                <div className="shimmer h-16 rounded-2xl border border-neutral-800 bg-neutral-900/40" />
              }
            >
              <FiltersBar />
            </Suspense>
          </div>
        </header>
        <main className="flex-1 min-h-0 px-5 py-5">{children}</main>
      </div>
    </div>
  );
}
