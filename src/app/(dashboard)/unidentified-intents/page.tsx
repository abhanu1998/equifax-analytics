"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
  HorizontalDistribution,
  IntentPieChart,
  StandardBarChart,
} from "@/components/dashboard/charts";
import { MetricCard } from "@/components/dashboard/metric-card";

const categoryData = [
  { label: "Tax form 46B inquiries", value: 34 },
  { label: "Benefits verification questions", value: 29 },
  { label: "Payroll direct deposit queries", value: 24 },
  { label: "Tax transaction service queries", value: 18 },
  { label: "PTO balance policy questions", value: 13 },
];

const trendData = [
  { label: "08", value: 9 },
  { label: "09", value: 16 },
  { label: "10", value: 26 },
  { label: "11", value: 31 },
  { label: "12", value: 24 },
  { label: "13", value: 20 },
  { label: "14", value: 27 },
  { label: "15", value: 22 },
  { label: "16", value: 17 },
  { label: "17", value: 10 },
];

const sampleRows = [
  {
    session: "CC-2026-0137",
    summary:
      "Caller inquired about timeline for payroll direct deposit and expected posting date.",
  },
  {
    session: "CC-2026-0112",
    summary:
      "Caller wanted to update direct deposit bank account and clarify effect timeline.",
  },
  {
    session: "CC-2026-0098",
    summary:
      "Customer requested tax category support and was routed to review queue.",
  },
];

export default function UnidentifiedIntentsPage() {
  return (
    <DashboardShell
      title="Unidentified Intents"
      subtitle="Preview experience using placeholder data until backend endpoints are available"
    >
      <div className="mb-4 rounded-2xl border border-amber-700/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Preview data: this module is currently backed by designed placeholder data.
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Unidentified Calls" value={115} />
        <MetricCard label="Escalation Rate" value={42.6} format="percent" tone="negative" />
        <MetricCard label="Avg Resolution Time" value={318} format="duration" />
        <MetricCard label="Direct Transfers" value={28} tone="positive" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Category Distribution" subtitle="LLM-clustered unknown intents">
          <HorizontalDistribution data={categoryData} />
        </ChartCard>
        <ChartCard title="Intent Group Split" subtitle="Top unidentified groups">
          <IntentPieChart data={categoryData} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Hourly Unidentified Trend">
          <StandardBarChart data={trendData} valueColor="#ef4444" />
        </ChartCard>
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/45 p-4">
          <h3 className="text-sm text-white">Sample Payload (Placeholder Rows)</h3>
          <div className="mt-3 space-y-2">
            {sampleRows.map((row) => (
              <article
                key={row.session}
                className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                  {row.session}
                </p>
                <p className="mt-1 text-sm text-neutral-200">{row.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
