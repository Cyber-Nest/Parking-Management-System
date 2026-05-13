"use client";

import React from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReconciliationChartsProps {
  chartData: Array<{
    name: string;
    collected: number;
    deposited: number;
    variance: number;
  }>;
  pieData?: Array<{
    name: string;
    value: number;
    color: string;
    percentage: string;
  }>;
  loading?: boolean;
}

const ChartSkeleton = () => (
  <div className="h-[350px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)]" />
);

// Custom Tooltip for the Main Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const collected =
      payload.find((p: any) => p.dataKey === "collected")?.value || 0;
    const deposited =
      payload.find((p: any) => p.dataKey === "deposited")?.value || 0;
    const variancePercent =
      deposited !== 0
        ? (((collected - deposited) / deposited) * 100).toFixed(1)
        : 0;

    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] font-black text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">
          {label}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-8">
            <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">
              Collected:
            </span>
            <span className="text-xs font-black text-emerald-500">
              ${collected.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">
              Deposited:
            </span>
            <span className="text-xs font-black text-blue-500">
              ${deposited.toLocaleString()}
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--color-border)] flex justify-between">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
              Variance:
            </span>
            <span
              className={`text-[10px] font-black ${Number(variancePercent) >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            >
              {variancePercent}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const defaultPieData = [
  {
    name: "Credit / Debit Card",
    value: 32450,
    color: "var(--color-primary)",
    percentage: "71.0%",
  },
  {
    name: "Bank Transfers",
    value: 9120,
    color: "#10B981",
    percentage: "20.0%",
  },
  { name: "Mobile App", value: 2108, color: "#F59E0B", percentage: "4.6%" },
  {
    name: "Admin Adjustments",
    value: 2000,
    color: "#8B5CF6",
    percentage: "4.4%",
  },
];

export const ReconciliationCharts = ({
  chartData,
  pieData = defaultPieData,
  loading = false,
}: ReconciliationChartsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="lg:col-span-1">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Composed Chart (Left/Center) */}
      <div className="lg:col-span-2 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em]">
            Institutional Liquidity Flow
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
                Collected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
                Deposited
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
                Variance
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-muted)", fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v / 1000}k`}
                tick={{ fill: "var(--color-text-muted)" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--color-text-muted)" }}
                domain={[-10, 10]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--color-surface-soft)", opacity: 0.4 }}
              />
              <Bar
                yAxisId="left"
                dataKey="collected"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                yAxisId="left"
                dataKey="deposited"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="variance"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "#EF4444",
                  strokeWidth: 2,
                  stroke: "var(--color-surface)",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col items-center">
        <h3 className="w-full text-xs font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em] mb-8 text-left">
          Settlement Channels
        </h3>

        {/* DONUT CHART CONTAINER */}
        <div className="relative w-full h-[200px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
              Total
            </span>
            <span className="text-xl font-black text-[var(--color-text-primary)] tracking-tighter">
              ${pieData.reduce((sum, p) => sum + p.value, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* LEGEND LIST */}
        <div className="w-full mt-auto border-t border-[var(--color-border)] pt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {pieData.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 group transition-all px-1"
            >
              {/* Dot Icon */}
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />

              {/* Label Text */}
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  {item.name}
                </span>
                {/* <span className="text-[8px] font-bold text-[var(--color-text-muted)]">{item.percentage}</span> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
