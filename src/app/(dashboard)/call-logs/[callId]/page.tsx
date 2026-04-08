"use client";

import { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useApiData } from "@/hooks/use-api-data";
import type {
  CallDetailResponse,
  CallRecord,
  TimelineEntry,
  TranscriptResponse,
} from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { StatusPill } from "@/components/dashboard/status-pill";

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="shimmer h-[560px] rounded-2xl border border-neutral-800 bg-neutral-900/50 xl:col-span-2" />
      <div className="shimmer h-[560px] rounded-2xl border border-neutral-800 bg-neutral-900/50" />
    </div>
  );
}

function renderTimelineEntries(
  detail: CallDetailResponse | null,
  transcript: TranscriptResponse | null,
): TimelineEntry[] {
  if (detail?.timeline?.length) {
    return detail.timeline;
  }

  return (transcript?.messages ?? []).map((message) => ({
    type: "message",
    role: message.role,
    timestamp: message.timestamp,
    content: message.content,
  }));
}

function CallDetailPageContent() {
  const { callId } = useParams<{ callId: string }>();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const detailEndpoint = `/api/proxy/calls/${callId}/detail`;
  const basicEndpoint = `/api/proxy/calls/${callId}`;
  const transcriptEndpoint = `/api/proxy/calls/${callId}/transcript`;
  const recordingEndpoint = `/api/proxy/calls/${callId}/recording-url`;

  const { data: detail, isLoading, error } = useApiData<CallDetailResponse>(
    detailEndpoint,
    query,
  );
  const { data: basicCall } = useApiData<CallRecord>(basicEndpoint, query, 900);
  const { data: transcript } = useApiData<TranscriptResponse>(
    transcriptEndpoint,
    query,
    900,
  );
  const { data: recording } = useApiData<{ url: string; expires_in: number }>(
    recordingEndpoint,
    query,
    900,
  );

  const timeline = renderTimelineEntries(detail, transcript);
  const callRecord = detail?.call ?? basicCall ?? null;
  const showError = !!error && !callRecord;

  return (
    <DashboardShell
      title="Call Detail"
      subtitle="Transcript, transfer metadata, recording, and tool-call timeline"
    >
      {isLoading ? <DetailSkeleton /> : null}
      {!isLoading && showError ? (
        <div className="rounded-2xl border border-rose-800/50 bg-rose-500/10 p-4 text-rose-300">
          {error}
        </div>
      ) : null}

      {!isLoading && callRecord ? (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-neutral-800/70 bg-neutral-900/30 p-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                Session
              </p>
              <p className="mt-2 text-sm text-neutral-100">{callRecord.session_id}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                Duration
              </p>
              <p className="mt-2 text-sm text-neutral-100">
                {formatDuration(callRecord.call_duration_secs)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                Intent
              </p>
              <p className="mt-2 text-sm text-neutral-100">
                {callRecord.intent ?? "Unidentified"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                Start Time
              </p>
              <p className="mt-2 text-sm text-neutral-100">
                {format(new Date(callRecord.start_time), "dd MMM, yyyy HH:mm:ss")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/45 p-4 xl:col-span-2">
              <h2 className="text-lg font-light text-white">Transcript & Timeline</h2>
              <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-2">
                {timeline.map((entry, index) =>
                  entry.type === "message" ? (
                    <div
                      key={`${entry.timestamp}-${index}`}
                      className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                        <span>{entry.role}</span>
                        <span>{format(new Date(entry.timestamp), "HH:mm:ss")}</span>
                      </div>
                      <p className="text-sm text-neutral-200">{entry.content}</p>
                    </div>
                  ) : (
                    <div
                      key={`${entry.timestamp}-${index}`}
                      className="rounded-xl border border-emerald-800/50 bg-emerald-500/10 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-emerald-300">
                        <span>Tool: {entry.tool_name}</span>
                        <span>{format(new Date(entry.timestamp), "HH:mm:ss")}</span>
                      </div>
                      {entry.tool_error ? (
                        <p className="text-sm text-rose-300">{entry.tool_error}</p>
                      ) : (
                        <p className="text-sm text-emerald-100">
                          Tool call completed successfully
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/45 p-4">
                <h3 className="text-sm uppercase tracking-[0.16em] text-neutral-500">
                  Call Summary
                </h3>
                <div className="mt-3 space-y-3 text-sm text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <StatusPill text={callRecord.status} tone="positive" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transfer</span>
                    <StatusPill
                      text={
                        callRecord.was_transferred
                          ? callRecord.transfer_queue ?? "Transferred"
                          : "No Transfer"
                      }
                      tone={callRecord.was_transferred ? "warning" : "neutral"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transcript Exchanges</span>
                    <span className="text-neutral-100">
                      {detail?.transcript_exchanges ?? transcript?.messages?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transfer Time</span>
                    <span className="text-neutral-100">
                      {formatDuration(detail?.transfer_time_secs ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/45 p-4">
                <h3 className="text-sm uppercase tracking-[0.16em] text-neutral-500">
                  Recording Playback
                </h3>
                {recording?.url ? (
                  <audio controls className="mt-3 w-full">
                    <source src={recording.url} />
                  </audio>
                ) : (
                  <p className="mt-3 text-sm text-neutral-500">
                    Recording URL unavailable for this call.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/45 p-4">
                <h3 className="text-sm uppercase tracking-[0.16em] text-neutral-500">
                  Tool Calls
                </h3>
                <div className="mt-3 space-y-2">
                  {(detail?.tool_calls ?? []).length ? (
                    detail?.tool_calls?.map((call, index) => (
                      <div
                        key={`${call.name}-${index}`}
                        className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-xs text-neutral-300"
                      >
                        <p className="text-neutral-100">{call.name ?? "Tool Call"}</p>
                        <p className="mt-1 text-neutral-500">
                          {call.timestamp
                            ? format(new Date(call.timestamp), "dd MMM, HH:mm:ss")
                            : "No timestamp"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">
                      No tool calls recorded for this session.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
}

export default function CallDetailPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell
          title="Call Detail"
          subtitle="Transcript, transfer metadata, recording, and tool-call timeline"
        >
          <DetailSkeleton />
        </DashboardShell>
      }
    >
      <CallDetailPageContent />
    </Suspense>
  );
}
