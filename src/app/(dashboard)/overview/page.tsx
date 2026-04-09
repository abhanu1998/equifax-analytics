"use client";

import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  ChartCard,
  ChartCardSkeleton,
} from "@/components/dashboard/chart-card";
import {
  DualIntentBarChart,
  HorizontalDistribution,
  IntentPieChart,
  normalizeChartData,
  StandardBarChart,
} from "@/components/dashboard/charts";
import {
  MetricCard,
  MetricCardSkeleton,
} from "@/components/dashboard/metric-card";
import { useApiData } from "@/hooks/use-api-data";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { useUniformChartHeight } from "@/hooks/use-uniform-chart-height";
import type { AnalyticsResponse } from "@/lib/types";
import { safeNumber } from "@/lib/utils";

function AnalyticsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCardSkeleton title="Intent Distribution" />
        <ChartCardSkeleton title="Serviceable Intent Breakdown" />
        <ChartCardSkeleton title="Transfer by Queue" />
        <ChartCardSkeleton title="Transfer by Intent" />
        <ChartCardSkeleton title="Hourly Call Volume" />
        <ChartCardSkeleton title="Call End Reasons" />
      </div>
    </>
  );
}

function OverviewPageContent() {
  const { queryParams } = useDashboardFilters();
  const uniformChartHeight = useUniformChartHeight();

  const { data, isLoading, error } = useApiData<AnalyticsResponse>(
    "/api/proxy/analytics",
    queryParams,
  );

  const intentDistribution = normalizeChartData(data?.intent_category_distribution);
  const serviceable = normalizeChartData(data?.serviceable_intent_distribution);
  const transfersByQueue = normalizeChartData(data?.transfers_by_queue);
  const transfersByIntent = normalizeChartData(data?.transfers_by_intent);
  const hourly = normalizeChartData(data?.hourly_volume);
  const endReasons = normalizeChartData(data?.call_end_reasons);

  return (
    <DashboardShell
      title="Overview"
      subtitle="KPI board powered by Equifax voice intent analytics"
    >
      {isLoading ? <AnalyticsSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-800/50 bg-rose-500/10 p-5 text-rose-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Total Calls"
              value={safeNumber(data?.total_calls)}
              format="number"
            />
            <MetricCard
              label="Calls Transferred"
              value={safeNumber(data?.calls_transferred)}
              tone="positive"
            />
            <MetricCard
              label="Avg Handle Time"
              value={safeNumber(data?.avg_handle_time_secs)}
              format="duration"
            />
            <MetricCard
              label="Total Duration"
              value={safeNumber(data?.total_call_duration_secs)}
              format="duration"
            />
            <MetricCard
              label="Intent Recognition Rate"
              value={safeNumber(data?.intent_recognition_rate)}
              format="percent"
              tone={safeNumber(data?.intent_recognition_rate) >= 75 ? "positive" : "negative"}
            />
            <MetricCard
              label="Avg Calls / Hour"
              value={safeNumber(data?.avg_calls_per_hour)}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard title="Intent Distribution" subtitle="Category-level split">
              <IntentPieChart data={intentDistribution} height={uniformChartHeight} />
            </ChartCard>

            <ChartCard
              title="Serviceable Intent Breakdown"
              subtitle="Top serviceable intents by volume"
            >
              <HorizontalDistribution data={serviceable} height={uniformChartHeight} />
            </ChartCard>

            <ChartCard title="Transfer by Queue" subtitle="Queue volume">
              <IntentPieChart data={transfersByQueue} height={uniformChartHeight} />
            </ChartCard>

            <ChartCard
              title="Transfer by Intent"
              subtitle="Classified versus transferred calls"
            >
              <DualIntentBarChart data={transfersByIntent} height={uniformChartHeight} />
            </ChartCard>

            <ChartCard title="Hourly Call Volume" subtitle="Call traffic by hour">
              <StandardBarChart
                data={hourly}
                valueColor="#60a5fa"
                height={uniformChartHeight}
              />
            </ChartCard>

            <ChartCard title="Call End Reasons" subtitle="Conversation completion outcomes">
              <StandardBarChart
                data={endReasons}
                valueColor="#f87171"
                height={uniformChartHeight}
              />
            </ChartCard>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
}

export default function OverviewPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell
          title="Overview"
          subtitle="Real-time KPI board from Equifax voice intent analytics"
        >
          <AnalyticsSkeleton />
        </DashboardShell>
      }
    >
      <OverviewPageContent />
    </Suspense>
  );
}
