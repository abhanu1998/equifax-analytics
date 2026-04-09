"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Copy, Search, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useApiData } from "@/hooks/use-api-data";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import type { CallRecord } from "@/lib/types";
import { formatDuration, safeNumber } from "@/lib/utils";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

function resolveStatusTone(status?: string) {
  if (status === "closed") return "positive";
  if (status === "active") return "warning";
  if (status === "received") return "neutral";
  return "neutral";
}

function resolveEndReasonTone(reason?: string) {
  if (!reason) return "neutral";
  if (reason.toLowerCase().includes("disconnect")) return "negative";
  if (reason.toLowerCase().includes("transfer")) return "warning";
  return "positive";
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4">
      <div className="space-y-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="shimmer h-12 rounded-lg border border-neutral-800/60 bg-neutral-900/70"
          />
        ))}
      </div>
    </div>
  );
}

function CallLogsPageContent() {
  const { queryParams } = useDashboardFilters();
  const [page, setPage] = useState(0);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionInput, setSessionInput] = useState("");
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const baseDateQuery = useMemo(
    () => new URLSearchParams(queryParams.toString()),
    [queryParams],
  );

  const callsQuery = useMemo(() => {
    const query = new URLSearchParams(baseDateQuery.toString());
    query.set("limit", String(PAGE_SIZE));
    query.set("offset", String(page * PAGE_SIZE));
    if (sessionSearch.trim()) {
      query.set("session_id", sessionSearch.trim());
    }
    return query;
  }, [baseDateQuery, page, sessionSearch]);

  const countQuery = useMemo(() => {
    const query = new URLSearchParams(baseDateQuery.toString());
    if (sessionSearch.trim()) {
      query.set("session_id", sessionSearch.trim());
    }
    return query;
  }, [baseDateQuery, sessionSearch]);

  const { data: calls, isLoading, error } = useApiData<CallRecord[]>(
    "/api/proxy/calls",
    callsQuery,
  );
  const { data: countData } = useApiData<{ count: number }>(
    "/api/proxy/calls/count",
    countQuery,
    1000,
  );

  const totalCount = safeNumber(countData?.count);
  const maxPage = Math.max(0, Math.ceil(totalCount / PAGE_SIZE) - 1);

  function applySessionSearch() {
    setSessionSearch(sessionInput.trim());
    setPage(0);
  }

  function clearSessionSearch() {
    setSessionInput("");
    setSessionSearch("");
    setPage(0);
  }

  async function copySessionId(sessionId: string) {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopiedSessionId(sessionId);
      window.setTimeout(() => setCopiedSessionId(null), 1400);
    } catch {
      setCopiedSessionId(null);
    }
  }

  return (
    <DashboardShell
      title="Call Logs"
      subtitle="Paginated call records with intent and transfer metadata"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800/70 bg-neutral-900/30 p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applySessionSearch();
          }}
          className="flex min-w-[310px] items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
        >
          <Search className="size-4 text-neutral-500" />
          <input
            value={sessionInput}
            onChange={(event) => setSessionInput(event.target.value)}
            placeholder="Search by partial session id..."
            className="w-full bg-transparent text-sm text-neutral-100 outline-none"
          />
          {sessionInput ? (
            <button
              type="button"
              onClick={clearSessionSearch}
              className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
              aria-label="Clear session search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
          <Button type="submit" variant="secondary" className="h-8 px-3 py-1 text-xs">
            Search
          </Button>
        </form>
        <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          Total Calls: <span className="text-neutral-200">{totalCount}</span>
        </div>
      </div>

      {isLoading ? <TableSkeleton /> : null}
      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-800/50 bg-rose-500/10 p-4 text-rose-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-neutral-800 bg-neutral-950/70 text-left text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">End Reason</th>
                  <th className="px-4 py-3">Transfer</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(calls ?? []).map((call) => (
                  <tr
                    key={call.id}
                    className="border-b border-neutral-800/70 transition-colors hover:bg-neutral-800/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/call-logs/${call.id}`}
                          className="text-blue-300 hover:text-blue-200"
                        >
                          {call.session_id.slice(0, 12)}...
                        </Link>
                        <button
                          type="button"
                          onClick={() => copySessionId(call.session_id)}
                          className="rounded-md border border-neutral-800 bg-neutral-900 p-1 text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-100"
                          title="Copy session ID"
                          aria-label="Copy session ID"
                        >
                          {copiedSessionId === call.session_id ? (
                            <Check className="size-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {format(new Date(call.start_time), "dd MMM, HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3 text-neutral-200">
                      {formatDuration(call.call_duration_secs)}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {call.intent ?? "Unidentified"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        text={call.status}
                        tone={resolveStatusTone(call.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        text={call.end_reason ?? call.closed_reason ?? "N/A"}
                        tone={resolveEndReasonTone(call.end_reason)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {call.was_transferred ? (
                        <StatusPill
                          text={call.transfer_queue ?? "Transferred"}
                          tone="warning"
                        />
                      ) : (
                        <StatusPill text="No Transfer" tone="neutral" />
                      )}
                    </td>
                  </tr>
                ))}
                {(calls ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-neutral-500"
                    >
                      No calls found for the selected filter criteria.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          Page <span className="text-neutral-200">{page + 1}</span> of{" "}
          <span className="text-neutral-200">{maxPage + 1}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPage((prev) => Math.min(maxPage, prev + 1))}
            disabled={page >= maxPage}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function CallLogsPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell
          title="Call Logs"
          subtitle="Paginated call records with intent and transfer metadata"
        >
          <TableSkeleton />
        </DashboardShell>
      }
    >
      <CallLogsPageContent />
    </Suspense>
  );
}
