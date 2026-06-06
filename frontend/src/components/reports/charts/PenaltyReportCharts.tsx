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
import { ChevronDown, AlertCircle } from "lucide-react";

interface PenaltyReportChartsProps {
  trendData: { name: string; count: number }[];
  violationData: { name: string; value: number; color: string }[];
  totalTickets?: number;
  loading?: boolean;
  onPeriodChange?: (period: string) => void;
}

const periodOptions = [
  { label: "Daily View", value: "daily" },
  { label: "Weekly View", value: "weekly" },
  { label: "Monthly View", value: "monthly" },
];

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-3xl border border-[var(--color-border)]" />
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        {label && <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-1">{label}</p>}
        <p className="text-sm font-black text-[#F43F5E]">
          {payload[0].value} <span className="text-[var(--color-text-tertiary)] font-medium text-[10px]">Tickets</span>
        </p>
      </div>
    );
  }
  return null;
};

export const PenaltyReportCharts = ({
  trendData,
  violationData,
  totalTickets = 0,
  loading = false,
  onPeriodChange,
}: PenaltyReportChartsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (onPeriodChange) onPeriodChange(period);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart: Tickets Issued Over Time */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertCircle size={18} className="text-[#F43F5E]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">Issuance Trend</h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Violation activity tracking</p>
            </div>
          </div>
          
          {/* <div className="relative group">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="appearance-none bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl px-4 py-2 pr-9 text-[11px] font-bold text-[var(--color-text-primary)] hover:border-[#F43F5E]/30 transition-all outline-none cursor-pointer"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-hover:text-[#F43F5E] pointer-events-none transition-colors" />
          </div> */}
        </div>

        <div className="h-[280px] w-full">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="penaltyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "var(--color-text-secondary)" }} dy={10} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "var(--color-text-muted)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#F43F5E"
                  strokeWidth={3}
                  fill="url(#penaltyGradient)"
                  animationDuration={1500}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#F43F5E" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Donut Chart: Tickets by Violation Type */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-black text-[var(--color-text-primary)]">Violation Breakdown</h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">Distribution by category</p>
          </div>
          <div className="px-3 py-1 bg-[#F43F5E]/10 rounded-full border border-[#F43F5E]/20">
             <span className="text-[10px] font-bold text-[#F43F5E] uppercase tracking-wider">{totalTickets} Total Tickets</span>
          </div>
        </div>

        <div className="h-[320px] w-full relative">
          {loading ? <ChartSkeleton /> : (
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12 lg:pb-16">
                <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">Penalties</span>
                <span className="text-2xl font-black text-[var(--color-text-primary)] leading-none">100%</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, bottom: 20 }}>
                  <Pie
                    data={violationData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cx="50%"
                    cy="45%" 
                  >
                    {violationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} className="hover:opacity-100 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip label={false} />} />
                  <Legend 
                    iconType="circle" 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};