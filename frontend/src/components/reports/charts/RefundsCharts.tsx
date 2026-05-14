"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
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
import {
  OverTimeData,
  ReasonData,
} from "@/services/refunds-adjustments.service";

interface RefundsChartsProps {
  overTimeData: OverTimeData[];
  reasonData: ReasonData[];
  loading?: boolean;
  totalAmount?: number;
  onDaysChange?: (days: number) => void;
}

const daysOptions = [
  { label: "7D", value: 7 },
  { label: "15D", value: 15 },
  { label: "30D", value: 30 },
];

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)]/50 rounded-2xl" />
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] backdrop-blur-md border border-[var(--color-border)] p-3 rounded-xl shadow-xl ring-1 ring-black/5">
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 border-b border-[var(--color-border)] pb-1">
          {label}
        </p>
        {payload.map((p: any, idx: number) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 mb-0.5"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {p.name}
              </span>
            </div>
            <span className="text-[11px] font-black" style={{ color: p.color }}>
              ${p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RefundsCharts = ({
  overTimeData,
  reasonData,
  loading = false,
  totalAmount = 0,
  onDaysChange,
}: RefundsChartsProps) => {
  const [selectedDays, setSelectedDays] = useState(30);

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    if (onDaysChange) onDaysChange(days);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart Section */}
      <div className="lg:col-span-2 bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)] tracking-tight">
              Trend Analysis
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Refunds vs Adjustments performance
            </p>
          </div>

          <div className="flex bg-[var(--color-surface-soft)] p-1 rounded-xl border border-[var(--color-border)]">
            {daysOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDaysChange(option.value)}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 ${
                  selectedDays === option.value
                    ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-black/5"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[320px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={overTimeData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="8 8"
                  vertical={false}
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: "var(--color-text-muted)", fontWeight: 600 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "var(--color-border)", strokeWidth: 2 }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "800",
                    paddingBottom: "20px",
                    textTransform: "uppercase",
                  }}
                  formatter={(value) => (
                    <span className="text-[var(--color-text-secondary)] ml-1">
                      {value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="refunds"
                  name="Refunds"
                  stroke="#F43F5E"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="adjustments"
                  name="Adjustments"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm flex flex-col">
        <div className="mb-2">
          <h3 className="text-base font-black text-[var(--color-text-primary)] tracking-tight">
            Distribution
          </h3>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Breakdown by reason
          </p>
        </div>

        <div className="flex-1 h-[320px] w-full relative">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasonData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {reasonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    itemStyle={{ padding: "2px 0" }}
                  />
                  <Legend
                    iconType="circle"
                    verticalAlign="bottom"
                    layout="vertical"
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      paddingTop: "20px",
                    }}
                    formatter={(value) => (
                      <span className="text-[var(--color-text-secondary)]">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-[85px]">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                  Total
                </span>
                <span className="text-2xl font-black text-[var(--color-text-primary)] leading-none mt-1">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
