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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface RevenueChartsProps {
  lineData: Array<{ date: string; revenue: number }>;
  typeData: Array<{ name: string; value: number; color: string }>;
  paymentData: Array<{ name: string; value: number; color: string }>;
  loading?: boolean;
  onFilterChange?: (days: number) => void;
}

const filterOptions = [
  { label: "7D", value: 7 },
  { label: "15D", value: 15 },
  { label: "30D", value: 30 },
];

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-3xl border border-[var(--color-border)]" />
);

// Custom Tooltip for Premium Branding
const CustomTooltip = ({ active, payload, label, isCurrency = true }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-1">
          {label}
        </p>
        <p className="text-sm font-black text-[var(--color-primary)]">
          {isCurrency
            ? `$${payload[0].value.toLocaleString()}`
            : payload[0].value}
          <span className="ml-1 text-[var(--color-text-tertiary)] font-medium text-[10px]">
            Revenue
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueCharts = ({
  lineData,
  typeData,
  paymentData,
  loading = false,
  onFilterChange,
}: RevenueChartsProps) => {
  const [selectedFilter, setSelectedFilter] = useState(7);

  const handleFilterChange = (days: number) => {
    setSelectedFilter(days);
    if (onFilterChange) onFilterChange(days);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Over Time  */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">
              Revenue Trend
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Income analysis over time
            </p>
          </div>
          <div className="flex bg-[var(--color-surface-soft)] p-1 rounded-xl border border-[var(--color-border)]">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                  selectedFilter === option.value
                    ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[240px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineData}
                margin={{ left: -20, right: 5, top: 10 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
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
                  dataKey="date"
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
                  tickFormatter={(v) => `$${v >= 1000 ? v / 1000 + "k" : v}`}
                  tick={{ fill: "var(--color-text-muted)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
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

      {/* Revenue by Type  */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">
            Revenue by Type
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Split by parking category
          </p>
        </div>
        <div className="h-[240px] w-full relative">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cx="50%"
                  cy="45%"
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip label={false} />} />
                <Legend
                  iconType="circle"
                  verticalAlign="bottom"
                  align="center"
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

      {/* Revenue by Payment */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">
            Payment Methods
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Transaction source distribution
          </p>
        </div>
        <div className="h-[240px] w-full relative">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cx="50%"
                  cy="45%"
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip label={false} />} />
                <Legend
                  iconType="circle"
                  verticalAlign="bottom"
                  align="center"
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
