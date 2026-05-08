"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import { ChartSkeleton } from "./ChartSkeleton";
import { ChartError } from "./ChartError";

import {
  chartService,
  RevenueFilter,
  ParkingFilter,
  RevenueItem,
  ParkingItem,
  PenaltyItem,
} from "@/services/chart.service";
import toast from "react-hot-toast";

export default function DashboardCharts() {
  const [revFilter, setRevFilter] = useState<RevenueFilter>("1 Month");
  const [parkFilter, setParkFilter] = useState<ParkingFilter>("7 Days");
  const [revenueData, setRevenueData] = useState<
    Record<RevenueFilter, RevenueItem[]>
  >({
    "1 Month": [],
    "3 Months": [],
    "6 Months": [],
    "12 Months": [],
  });
  const [parkingData, setParkingData] = useState<
    Record<ParkingFilter, ParkingItem[]>
  >({
    "7 Days": [],
    "15 Days": [],
    "30 Days": [],
  });
  const [penaltyData, setPenaltyData] = useState<PenaltyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //data fetch
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoading(true);
        const response = await chartService.getChartsData();
        setRevenueData(response.revenue);
        setParkingData(response.parking);
        setPenaltyData(response.penalties);
      } catch (error) {
        console.error(error);
        setError("Failed to load charts.");
        toast.error("Failed to load charts.");
      } finally {
        setLoading(false);
      }
    };
    fetchCharts();
  }, []);

  const selectedRevenueData = useMemo(() => {
    return revenueData[revFilter] || [];
  }, [revFilter, revenueData]);

  const selectedParkingData = useMemo(() => {
    return parkingData[parkFilter] || [];
  }, [parkFilter, parkingData]);

  const totalPenaltyAmount = useMemo(() => {
    return penaltyData.reduce((acc, curr) => acc + curr.value, 0);
  }, [penaltyData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Area Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[var(--color-text-primary)]">
            Revenue
          </h4>
          <select
            className="text-[11px] font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-md p-1.5 outline-none text-[var(--color-text-secondary)] cursor-pointer"
            value={revFilter}
            onChange={(e) => setRevFilter(e.target.value as RevenueFilter)}
          >
            {Object.keys(revenueData).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="h-[220px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <ChartError />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: "var(--color-text-muted)",
                  }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    boxShadow: "var(--shadow-soft)",
                    fontSize: "12px",
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
          )}
        </div>
      </div>

      {/* Parkings Bar Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[var(--color-text-primary)]">
            Parkings
          </h4>
          <select
            className="text-[11px] font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-md p-1.5 outline-none text-[var(--color-text-secondary)] cursor-pointer"
            value={parkFilter}
            onChange={(e) => setParkFilter(e.target.value as ParkingFilter)}
          >
            {Object.keys(parkingData).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="h-[220px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <ChartError />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedParkingData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: "var(--color-text-muted)",
                  }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: "var(--color-surface-soft)" }} />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary-light)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Penalties Donut Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <h4 className="font-bold text-[var(--color-text-primary)] mb-6">
          Penalties Overview
        </h4>

        <div className="h-[220px] w-full relative flex flex-col items-center">
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <ChartError />
          ) : (
            <>
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie
                    data={penaltyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={78}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {penaltyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Total
                </p>
                <p className="text-xl font-black text-[var(--color-text-primary)]">
                  ${totalPenaltyAmount}
                </p>
              </div>

              {/* Legends */}
              <div className="w-full mt-4 space-y-2">
                {penaltyData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[11px] font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[var(--color-text-secondary)]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[var(--color-text-primary)]">
                      ${item.value}.00
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
