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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { RevenueByPlanData, PlansSoldData, RevenueTrendData } from "@/services/plan-performance.service";

interface PlanPerformanceChartsProps {
  revenueByPlan: RevenueByPlanData[];
  plansSoldData: PlansSoldData[];
  revenueTrendData: RevenueTrendData[];
  loading?: boolean;
}

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-[var(--color-surface-soft)] rounded-3xl border border-[var(--color-border)]" />
);

const CustomTooltip = ({ active, payload, label, isCurrency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
        {label && <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-1">{label}</p>}
        <div className="flex flex-col gap-1">
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs font-black" style={{ color: p.color || p.fill }}>
              {p.name}: <span className="text-[var(--color-text-primary)]">
                {isCurrency ? `$${p.value.toLocaleString()}` : `${p.value} units`}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const PlanPerformanceCharts = ({ revenueByPlan, plansSoldData, revenueTrendData, loading = false }: PlanPerformanceChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Donut Chart: Revenue Distribution */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">Revenue by Plan</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Distribution across membership tiers</p>
        </div>
        <div className="h-[260px] w-full">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByPlan}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {revenueByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isCurrency={true} />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar Chart: Sales Volume */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">Plans Sold</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Volume of units moved per plan</p>
        </div>
        <div className="h-[260px] w-full">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plansSoldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontWeight: 600 }}
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)" }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-soft)', opacity: 0.4 }} />
                <Bar 
                  dataKey="qty" 
                  fill="var(--color-primary)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={24}
                  animationDuration={1500} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Line Chart: Growth Trends */}
      <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">Revenue Trends</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Historical performance by category</p>
        </div>
        <div className="h-[260px] w-full">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontWeight: 600 }}
                />
                <YAxis 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `$${v/1000}k`}
                  tick={{ fill: "var(--color-text-muted)" }} 
                />
                <Tooltip content={<CustomTooltip isCurrency={true} />} />
                <Line type="monotone" dataKey="daily" stroke="var(--color-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="hourly" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="monthly" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="evening" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
};