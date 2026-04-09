"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartDatum } from "@/lib/types";
import { safeNumber } from "@/lib/utils";

const PIE_COLORS = [
  "#7DD3FC",
  "#60A5FA",
  "#A78BFA",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#F472B6",
  "#93C5FD",
  "#34D399",
];

const INTENT_LABELS: Record<string, string> = {
  ews_edr: "EWS EDR",
  ews_proof_of_employment: "EWS Proof of Employment",
  ews_id_theft: "EWS ID Theft",
  ews_report_discrepancy: "EWS Report Discrepancy",
  ews_salary_key: "EWS Salary Key",
  twn_information: "TWN Information",
  twn_access_support: "TWN Access Support",
  ews_other: "EWS Other",
  nonserviceable: "Non Serviceable",
};

const EMPTY_CHART_HEIGHT = 280;

function prettifyLabel(label: string) {
  if (INTENT_LABELS[label]) {
    return INTENT_LABELS[label];
  }

  return label
    .replaceAll("_", " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function withOpacity(hex: string, opacity: number) {
  const value = hex.replace("#", "");
  const safe = value.length === 6 ? value : "94a3b8";
  const r = Number.parseInt(safe.slice(0, 2), 16);
  const g = Number.parseInt(safe.slice(2, 4), 16);
  const b = Number.parseInt(safe.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function toLabel(entry: Record<string, unknown>) {
  return (
    String(
      entry.label ??
        entry.name ??
        entry.intent ??
        entry.queue ??
        entry.reason ??
        entry.category ??
        entry.hour_label ??
        entry.hour ??
        entry.hour_of_day ??
        "Unknown",
    ) || "Unknown"
  );
}

function toHourLabel(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  const parsed = Number.parseInt(text, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 23) {
    return null;
  }
  return `${String(parsed).padStart(2, "0")}:00`;
}

function computeYAxisUpperBound(values: number[]) {
  const maxValue = values.reduce((max, value) => Math.max(max, safeNumber(value)), 0);
  if (maxValue <= 0) {
    return 10;
  }
  const headroom = Math.max(5, Math.ceil(maxValue * 0.1));
  return Math.max(10, Math.ceil((maxValue + headroom) / 10) * 10);
}

export function normalizeChartData(source: unknown[] | undefined): ChartDatum[] {
  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item) => {
    const record =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {};

    const hourLabel = toHourLabel(record.hour ?? record.hour_of_day);
    return {
      label: hourLabel ?? prettifyLabel(toLabel(record)),
      value: safeNumber(record.value ?? record.count ?? record.total ?? 0),
      transferred: safeNumber(
        record.transferred ??
          record.transferred_count ??
          record.inner_count ??
          record.transfer_count ??
          0,
      ),
      classified: safeNumber(
        record.classified ??
          record.outer_count ??
          record.total_count ??
          record.count ??
          0,
      ),
    };
  });
}

export function IntentPieChart({
  data,
  height = 340,
}: {
  data: ChartDatum[];
  height?: number;
}) {
  const chartData = data.filter((item) => item.value > 0);
  const total = chartData.reduce((acc, item) => acc + item.value, 0);
  const chartHeight = height;
  const shadowOuterRadius = Math.max(100, Math.round(chartHeight * 0.39));
  const shadowInnerRadius = Math.max(62, Math.round(chartHeight * 0.24));
  const mainOuterRadius = Math.max(96, shadowOuterRadius - 4);
  const mainInnerRadius = Math.max(58, shadowInnerRadius - 4);

  if (!chartData.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-neutral-500"
        style={{ height: chartHeight }}
      >
        No chart data in selected range.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart margin={{ top: 12, right: 8, left: 8, bottom: 12 }}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="label"
          cx="36%"
          cy="53%"
          innerRadius={shadowInnerRadius}
          outerRadius={shadowOuterRadius}
          stroke="none"
          isAnimationActive
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`donut-shadow-${entry.label}-${index}`}
              fill={withOpacity(PIE_COLORS[index % PIE_COLORS.length], 0.42)}
            />
          ))}
        </Pie>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="label"
          cx="36%"
          cy="50%"
          innerRadius={mainInnerRadius}
          outerRadius={mainOuterRadius}
          stroke="#0B1020"
          strokeWidth={2}
          isAnimationActive
          label={false}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`donut-main-${entry.label}-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: "12px", color: "#D4D4D8", lineHeight: "20px" }}
          formatter={(value, _, idx) => {
            const point = chartData[idx];
            const pct = total ? ((point?.value ?? 0) / total) * 100 : 0;
            return `${value} (${(point?.value ?? 0).toLocaleString()} • ${pct.toFixed(1)}%)`;
          }}
        />
        <Tooltip
          formatter={(value, name) => {
            const numberValue = safeNumber(value);
            const pct = total ? (numberValue / total) * 100 : 0;
            return [
              `${numberValue.toLocaleString()} (${pct.toFixed(1)}%)`,
              String(name),
            ];
          }}
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#e5e7eb",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalDistribution({
  data,
  height = 340,
}: {
  data: ChartDatum[];
  height?: number;
}) {
  const chartData = [...data]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const chartHeight = height;

  if (!chartData.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-neutral-500"
        style={{ height: EMPTY_CHART_HEIGHT }}
      >
        No chart data in selected range.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, left: 12, right: 30, bottom: 4 }}
      >
        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis
          dataKey="label"
          type="category"
          width={168}
          tick={{ fill: "#d4d4d8", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#e5e7eb",
          }}
        />
        <Bar dataKey="value" fill="#93C5FD" radius={[0, 8, 8, 0]} barSize={22}>
          <LabelList
            dataKey="value"
            position="right"
            fill="#E4E4E7"
            fontSize={12}
            formatter={(value) => safeNumber(value).toLocaleString()}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DualIntentBarChart({
  data,
  height = 340,
}: {
  data: ChartDatum[];
  height?: number;
}) {
  const chartData = data
    .map((item) => ({
      ...item,
      classified: item.classified ?? 0,
      transferred: item.transferred ?? 0,
    }))
    .sort((a, b) => (b.classified ?? 0) - (a.classified ?? 0));
  const chartHeight = height;

  if (!chartData.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-neutral-500"
        style={{ height: EMPTY_CHART_HEIGHT }}
      >
        No chart data in selected range.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 30, left: 12, bottom: 4 }}
      >
        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={168}
          tick={{ fill: "#E4E4E7", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#e5e7eb",
          }}
        />
        <Legend />
        <Bar
          name="Classified"
          dataKey="classified"
          fill="#64748b"
          radius={[0, 8, 8, 0]}
          barSize={16}
        >
          <LabelList
            dataKey="classified"
            position="right"
            fill="#CBD5E1"
            fontSize={11}
            formatter={(value) => safeNumber(value).toLocaleString()}
          />
        </Bar>
        <Bar
          name="Transferred"
          dataKey="transferred"
          fill="#10b981"
          radius={[0, 8, 8, 0]}
          barSize={16}
        >
          <LabelList
            dataKey="transferred"
            position="right"
            fill="#A7F3D0"
            fontSize={11}
            formatter={(value) => safeNumber(value).toLocaleString()}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StandardBarChart({
  data,
  valueColor = "#64748b",
  yMax,
  height = 340,
}: {
  data: ChartDatum[];
  valueColor?: string;
  yMax?: number;
  height?: number;
}) {
  const computedYMax =
    typeof yMax === "number"
      ? yMax
      : computeYAxisUpperBound(data.map((item) => safeNumber(item.value)));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 18 }}>
        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
        <YAxis
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          domain={[0, computedYMax]}
          allowDataOverflow
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#e5e7eb",
          }}
        />
        <Bar dataKey="value" fill={valueColor} radius={[8, 8, 0, 0]}>
          <LabelList
            dataKey="value"
            position="top"
            fill="#E4E4E7"
            fontSize={11}
            formatter={(value) => safeNumber(value).toLocaleString()}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
