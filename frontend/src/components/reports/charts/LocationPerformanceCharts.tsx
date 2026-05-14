"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  LocationRevenueData,
  LocationOccupancyData,
} from "@/services/location-performance.service";

interface LocationPerformanceChartsProps {
  revenueData: LocationRevenueData[];
  occupancyData: LocationOccupancyData[];
  loading?: boolean;
}

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)]" />
);

const CustomTooltip = ({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-1">
          {label}
        </p>
        <p className="text-sm font-black text-[var(--color-primary)]">
          {prefix}
          {payload[0].value}
          {suffix}
        </p>
      </div>
    );
  }
  return null;
};

export const LocationPerformanceCharts = ({
  revenueData,
  occupancyData,
  loading = false,
}: LocationPerformanceChartsProps) => {
  const avgOccupancy =
    occupancyData.length > 0
      ? occupancyData.reduce((sum, d) => sum + d.rate, 0) / occupancyData.length
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col mb-6">
          <h3 className="text-sm font-black tracking-tight text-[var(--color-text-primary)]">
            Revenue by Location
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Total earnings across parking zones
          </p>
        </div>

        <div className="h-[300px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                layout="vertical"
                margin={{ left: 40, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  horizontal={false}
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  type="number"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}K`}
                  tick={{ fill: "var(--color-text-muted)", fontWeight: 500 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  fontSize={11}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-primary)", fontWeight: 600 }}
                />
                <Tooltip
                  content={<CustomTooltip prefix="$" />}
                  cursor={{ fill: "var(--color-surface-soft)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-primary)"
                  radius={[0, 8, 8, 0]}
                  barSize={20}
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Occupancy Rate  */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col mb-6">
          <h3 className="text-sm font-black tracking-tight text-[var(--color-text-primary)]">
            Occupancy Rate
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Space utilization against average performance
          </p>
        </div>

        <div className="h-[300px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 10 }}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                />
                <YAxis
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  tick={{ fill: "var(--color-text-muted)", fontWeight: 500 }}
                />
                <Tooltip
                  content={<CustomTooltip suffix="%" />}
                  cursor={{ fill: "var(--color-surface-soft)", opacity: 0.4 }}
                />
                <ReferenceLine
                  y={avgOccupancy}
                  stroke="var(--color-primary)"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `Avg: ${avgOccupancy.toFixed(0)}%`,
                    position: "top",
                    fontSize: 10,
                    fontWeight: 700,
                    fill: "var(--color-primary)",
                    offset: 10,
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="#6c4fb2ff"
                  radius={[8, 8, 0, 0]}
                  barSize={32}
                >
                  {occupancyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate > avgOccupancy ? "#8B5CF6" : "#A78BFA"}
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
