"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  PerformanceTrendData,
  TopOfficerData,
} from "@/services/officer-performance.service";

interface OfficerPerformanceChartsProps {
  trendData: PerformanceTrendData[];
  topOfficersData: TopOfficerData[];
  loading?: boolean;
  onFilterChange?: (days: number) => void;
}

const filterOptions = [
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
];

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)]" />
);

// Custom Tooltip for a "Luxury" feel
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-80">
        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-1">
          {label}
        </p>
        <p className="text-sm font-black text-[var(--color-primary)]">
          {payload[0].value}{" "}
          <span className="text-[var(--color-text-tertiary)] font-medium">
            Tickets
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const OfficerPerformanceCharts = ({
  trendData,
  topOfficersData,
  loading = false,
  onFilterChange,
}: OfficerPerformanceChartsProps) => {
  const [activeFilter, setActiveFilter] = useState(7);

  const handleFilterClick = (days: number) => {
    setActiveFilter(days);
    if (onFilterChange) {
      onFilterChange(days);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart - Trend Analysis */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-sm font-black tracking-tight text-[var(--color-text-primary)]">
              Tickets Issued Over Time
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Activity trend across the selected period
            </p>
          </div>

          {/* Filter Buttons */}
          {/* <div className="flex bg-[var(--color-surface-soft)] p-1 rounded-lg">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterClick(option.value)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                  activeFilter === option.value
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div> */}
        </div>

        <div className="h-[280px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="ticketGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tick={{
                    fill: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "var(--color-primary)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fill="url(#ticketGradient)"
                  animationDuration={1500}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: "var(--color-primary)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar Chart - Top Performers */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex flex-col mb-6">
          <h3 className="text-sm font-black tracking-tight text-[var(--color-text-primary)]">
            Top 5 Officers
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Performance leaderboard based on issuance
          </p>
        </div>

        <div className="h-[280px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topOfficersData}
                layout="vertical"
                margin={{ left: 20, right: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--color-border)"
                  opacity={0.3}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  fontSize={11}
                  width={90}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-primary)", fontWeight: 600 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--color-surface-soft)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                  animationDuration={1500}
                >
                  {topOfficersData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="var(--color-primary)"
                      fillOpacity={1 - index * 0.15}
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
