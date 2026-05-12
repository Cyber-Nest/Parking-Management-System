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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface ParkingUsageChartsProps {
  sessionsData: { name: string; sessions: number }[];
  hourlyData: { hour: string; value: number }[];
  planTypeData: { name: string; value: number; color: string }[];
  loading?: boolean;
  onDaysChange?: (days: number) => void;
}

const daysOptions = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 15 Days", value: 15 },
  { label: "Last 30 Days", value: 30 },
];

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-3xl border border-[var(--color-border)]" />
);

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-1">
          {label}
        </p>
        <p className="text-sm font-black text-[var(--color-primary)]">
          {payload[0].value}{" "}
          <span className="text-[var(--color-text-tertiary)] font-medium text-[10px]">
            {unit}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const ParkingUsageCharts = ({
  sessionsData,
  hourlyData,
  planTypeData,
  loading = false,
  onDaysChange,
}: ParkingUsageChartsProps) => {
  const [selectedDays, setSelectedDays] = useState(30);

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    if (onDaysChange) {
      onDaysChange(days);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sessions Over Time - Area Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-[var(--color-text-primary)]">
              Usage Trends
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Total parking sessions
            </p>
          </div>

          <div className="relative group">
            <select
              value={selectedDays}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              className="appearance-none bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl px-4 py-2 pr-9 text-[11px] font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors outline-none cursor-pointer"
            >
              {daysOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors pointer-events-none"
            />
          </div>
        </div>

        <div className="h-[240px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sessionsData}
                margin={{ left: -20, right: 5, top: 10 }}
              >
                <defs>
                  <linearGradient
                    id="sessionsGradient"
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
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-secondary)" }}
                  dy={10}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-muted)" }}
                />
                <Tooltip content={<CustomTooltip unit="Sessions" />} />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fill="url(#sessionsGradient)"
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

      {/* Hourly Usage - Bar Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">
            Peak Activity
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Average hourly occupancy
          </p>
        </div>
        <div className="h-[240px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyData}
                margin={{ left: -20, right: 5, top: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="hour"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-secondary)" }}
                  dy={10}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-muted)" }}
                />
                <Tooltip
                  content={<CustomTooltip unit="Avg" />}
                  cursor={{ fill: "var(--color-surface-soft)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sessions by Plan Type - Donut Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">
            Membership Split
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Usage by plan category
          </p>
        </div>
        <div className="h-[240px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planTypeData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {planTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip label={false} unit="Sessions" />}
                />
                <Legend
                  iconType="circle"
                  verticalAlign="bottom"
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: "600",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
