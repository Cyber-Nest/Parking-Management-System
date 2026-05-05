"use client";

import React from "react";
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
} from "recharts";

// Mock Data
const revenueData = [
  { day: "May 15", value: 1800 },
  { day: "May 16", value: 2400 },
  { day: "May 17", value: 2200 },
  { day: "May 18", value: 3400 },
  { day: "May 19", value: 2300 },
  { day: "May 20", value: 2500 },
  { day: "May 21", value: 3600 },
];

const parkingData = [
  { day: "May 15", count: 210 },
  { day: "May 16", count: 180 },
  { day: "May 17", count: 200 },
  { day: "May 18", count: 270 },
  { day: "May 19", count: 220 },
  { day: "May 20", count: 190 },
  { day: "May 21", count: 210 },
];

const penaltyData = [
  { name: "Unpaid", value: 320, color: "#ef4444" },
  { name: "Paid", value: 680, color: "var(--color-success)" },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Area Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[var(--color-text-primary)]">
            Revenue (Last 7 Days)
          </h4>
          <select className="text-[10px] font-bold bg-gray-50 border-none rounded-lg p-1 outline-none">
            <option>Last 7 Days</option>
          </select>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{
                  fontWeight: "bold",
                  color: "var(--color-primary)",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/*Parkings Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[var(--color-text-primary)]">
            Parkings Per Day
          </h4>
          <select className="text-[10px] font-bold bg-gray-50 border-none rounded-lg p-1 outline-none">
            <option>Last 7 Days</option>
          </select>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parkingData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="count"
                fill="#818cf8"
                radius={[6, 6, 0, 0]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Penalties Donut Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <h4 className="font-bold text-[var(--color-text-primary)] mb-6">
          Penalties Overview
        </h4>
        <div className="h-[220px] w-full relative flex flex-col items-center">
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie
                data={penaltyData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {penaltyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Total
            </p>
            <p className="text-lg font-black text-[var(--color-text-primary)]">
              $1,000
            </p>
          </div>

          {/* Legends */}
          <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-500">Unpaid Penalties</span>
              </div>
              <span className="text-[var(--color-text-primary)]">
                $320.00 (31%)
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]" />
                <span className="text-gray-500">Paid Penalties</span>
              </div>
              <span className="text-[var(--color-text-primary)]">
                $680.00 (69%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
