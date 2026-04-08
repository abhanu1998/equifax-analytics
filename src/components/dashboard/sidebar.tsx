"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  LogOut,
  MessageSquareWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    href: "/call-logs",
    label: "Call Logs",
    icon: ClipboardList,
  },
  {
    href: "/unidentified-intents",
    label: "Calls of Undefined Intents",
    icon: MessageSquareWarning,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("eqx_sidebar_collapsed") === "true";
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("eqx_sidebar_collapsed", String(next));
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-neutral-800/80 bg-neutral-950/90 px-3 py-6 transition-all lg:flex lg:flex-col",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div
        className={cn(
          "mb-8 flex items-center",
          collapsed ? "justify-center" : "gap-3 px-2",
        )}
      >
        {!collapsed ? (
          <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
            <Image
              src="/equifax-logo.svg"
              alt="Equifax"
              width={160}
              height={36}
              className="h-auto w-auto max-w-[160px]"
            />
            <p className="text-lg font-light text-white">Equifax Analytics Dashboard</p>
          </div>
        ) : (
          <div className="grid size-10 place-items-center rounded-xl border border-neutral-700 bg-neutral-900">
            <Image
              src="/equifax-logo.svg"
              alt="Equifax"
              width={26}
              height={26}
              className="h-auto w-auto max-w-[26px]"
            />
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex rounded-xl border py-3 text-sm transition-all",
                collapsed ? "justify-center px-2" : "items-center gap-3 px-4",
                isActive
                  ? "border-neutral-600 bg-neutral-800/60 text-white"
                  : "border-neutral-900 bg-transparent text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/70 hover:text-neutral-100",
              )}
              title={item.label}
            >
              <Icon className="size-4" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto rounded-xl border border-neutral-800 bg-neutral-900/60 p-2",
          collapsed ? "space-y-2" : "grid grid-cols-2 gap-2",
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/70 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white",
            collapsed ? "h-10 w-full" : "h-10",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="mr-2 size-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white",
              collapsed ? "h-10" : "h-10",
            )}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="size-4" />
            {!collapsed ? <span className="ml-2 text-xs">Logout</span> : null}
          </button>
        </form>
      </div>
    </aside>
  );
}
