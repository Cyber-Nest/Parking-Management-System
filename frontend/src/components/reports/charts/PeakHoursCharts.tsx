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
} from "recharts";
import { OccupancyByHourData, HeatmapData } from "@/services/peak-hours.service";

interface PeakHoursChartsProps {
  occupancyData: OccupancyByHourData[];
  heatmapData: HeatmapData[];
  loading?: boolean;
}

const getCellColor = (value: number) => {
  if (value === 0) return "bg-[#edf7ed]"; // Very light green/empty
  if (value < 20) return "bg-[#c6e9c6]"; 
  if (value < 40) return "bg-[#a8e0a8]";
  if (value < 60) return "bg-[#fef08a]"; // Yellowish
  if (value < 80) return "bg-[#fb923c]"; // Orange
  return "bg-[#ef4444]"; // Red (High)
};

const TIMES_LABELS = ["12 AM", "2 AM", "4 AM", "6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"];

const ChartSkeleton = () => (
  <div className="h-[320px] w-full animate-pulse bg-gray-100 rounded-2xl border border-gray-200" />
);

export const PeakHoursCharts = ({ occupancyData, heatmapData, loading = false }: PeakHoursChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Occupancy Heatmap Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col mb-8">
          <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-1">
            Occupancy Heatmap 
          </h3>
          <p className="text-[11px] text-gray-500">Average occupancy (%) by day and hour</p>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[450px]">
              {/* Heatmap Grid */}
              <div className="flex flex-col gap-[4px]">
                {heatmapData.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    {/* Day Label */}
                    <span className="w-8 text-[11px] font-semibold text-gray-500 uppercase">
                      {day.day.substring(0, 3)}
                    </span>
                    
                    {/* Cells Container */}
                    <div className="flex-1 flex gap-[3px]">
                      {Array.from({ length: 24 }).map((_, tIdx) => {
                        const rate = day.hours[tIdx] || 0;
                        return (
                          <div
                            key={tIdx}
                            className={`flex-1 aspect-square rounded-[2px] ${getCellColor(rate)} transition-colors hover:ring-1 ring-gray-300 cursor-pointer`}
                            title={`${day.day} ${tIdx}:00 - ${rate}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Time Labels */}
              <div className="flex mt-3 ml-12">
                <div className="flex-1 flex justify-between text-[10px] font-medium text-gray-400">
                  {TIMES_LABELS.map((t) => (
                    <span key={t} className="w-0 flex justify-center whitespace-nowrap">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-2 max-w-[280px] mx-auto">
                <div className="h-[8px] w-full rounded-full bg-gradient-to-r from-[#c6e9c6] via-[#fef08a] to-[#ef4444]" />
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*Average Occupancy Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col mb-8">
          <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-1">
            Average Occupancy by Hour 
          </h3>
          <p className="text-[11px] text-gray-500">Average occupancy percentage for each hour</p>
        </div>

        <div className="h-[250px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="hour"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#94a3b8", fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#occGradient)"
                  dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#fff", stroke: "var(--color-primary)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};