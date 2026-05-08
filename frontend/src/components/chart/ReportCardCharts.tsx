"use client";

import React, { useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Download,
  Eye,
  Calendar,
  Clock3,
  FileBarChart,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ReportCardProps {
  id: number;
  title: string;
  desc: string;
  icon: React.ReactElement;
  color: string;
  type: string;
  onClick?: () => void;
  onDownload?: () => void;
  features?: string[];
  hasGraph?: boolean;
}

const lineData = [
  { day: "Mon", v: 30 },
  { day: "Tue", v: 50 },
  { day: "Wed", v: 35 },
  { day: "Thu", v: 80 },
  { day: "Fri", v: 45 },
  { day: "Sat", v: 95 },
  { day: "Sun", v: 70 },
];

const barData = [
  { day: "Mon", v: 40 },
  { day: "Tue", v: 70 },
  { day: "Wed", v: 45 },
  { day: "Thu", v: 90 },
  { day: "Fri", v: 65 },
  { day: "Sat", v: 30 },
  { day: "Sun", v: 50 },
];

const pieData = [
  {
    name: "Paid",
    value: 70,
  },
  {
    name: "Pending",
    value: 20,
  },
  {
    name: "Overdue",
    value: 10,
  },
];

const ReportCard = ({
  id,
  title,
  desc,
  icon,
  color,
  type,
  onClick,
  onDownload,
  features = [],
  hasGraph = false,
}: ReportCardProps) => {
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [viewed, setViewed] = useState(false);

  const [selectedRange, setSelectedRange] = useState("7D");

  const reportMeta = useMemo(() => {
    return {
      generatedAt: "May 21, 2025",
      updated: "10 mins ago",
      records: Math.floor(Math.random() * 900 + 100),
    };
  }, []);

  const handleView = () => {
    setViewed(true);

    if (onClick) {
      onClick();
    }
  };

  const renderVisual = () => {
    if (!hasGraph) return null;

    switch (type) {
      case "line":
        return (
          <div className="h-28 w-full mt-4 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case "bar":
        return (
          <div className="h-28 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <Tooltip />

                <Bar
                  dataKey="v"
                  fill="var(--color-primary-light)"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "pie":
        return (
          <div className="h-28 w-full mt-4 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />

                <Pie
                  data={pieData}
                  innerRadius={28}
                  outerRadius={42}
                  paddingAngle={6}
                  dataKey="value"
                >
                  <Cell fill="var(--color-primary)" />

                  <Cell fill="var(--color-accent)" />

                  <Cell fill="var(--color-border)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case "heatmap":
        return (
          <div className="mt-6 mb-2">
            <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-3 tracking-[0.1em]">
              Hourly Traffic Density
            </p>

            <div className="grid grid-cols-12 gap-1.5">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  title={`Hour ${i}`}
                  className={`h-5 rounded-[4px] transition-all ${
                    i >= 10 && i <= 16
                      ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                      : i % 4 === 0
                        ? "bg-[var(--color-primary)] opacity-40"
                        : "bg-gray-100"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between mt-2 px-0.5 opacity-60">
              <span className="text-[9px] font-black text-gray-400">12 AM</span>

              <span className="text-[9px] font-black text-gray-400">12 PM</span>

              <span className="text-[9px] font-black text-gray-400">11 PM</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      className="bg-white p-6 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col transition-all relative overflow-hidden h-full"
    >
      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* <div
            className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}
          >
            {React.cloneElement(
              icon as React.ReactElement<any>,
              {
                size: 22,
              },
            )}
          </div> */}

          <div className="flex flex-col items-end gap-1">
            {viewed && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <CheckCircle2 size={11} />
                Viewed
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-1 tracking-tight">
          {title}
        </h4>

        <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-5 opacity-80">
          {desc}
        </p>

        {/* Meta */}
        {/* <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
              <Calendar
                size={11}
              />
              Date
            </div>

            <p className="text-[11px] font-black mt-1 text-[var(--color-text-primary)]">
              {
                reportMeta.generatedAt
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
              <Clock3
                size={11}
              />
              Update
            </div>

            <p className="text-[11px] font-black mt-1 text-[var(--color-text-primary)]">
              {
                reportMeta.updated
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
              <FileBarChart
                size={11}
              />
              Records
            </div>

            <p className="text-[11px] font-black mt-1 text-[var(--color-text-primary)]">
              {
                reportMeta.records
              }
            </p>
          </div>
        </div> */}

        {/* Features */}
        {type !== "heatmap" && features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {features.map((f, i) => (
              <li
                key={i}
                className="text-[11px] font-medium text-[var(--color-text-muted)] flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)]" />

                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Graph Header */}
        {/* {hasGraph && (
          <div className="flex items-center justify-between mt-1 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Analytics
              Preview
            </p>

            <div className="flex items-center gap-1">
              {[
                "7D",
                "1M",
                "3M",
              ].map(
                (
                  item,
                ) => (
                  <button
                    key={
                      item
                    }
                    onClick={() =>
                      setSelectedRange(
                        item,
                      )
                    }
                    className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${
                      selectedRange ===
                      item
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        )} */}

        {/* Graph */}
        <div className="block flex-1">{renderVisual()}</div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-5 mt-5 border-t border-gray-50">
        {/* View */}
        <button
          onClick={handleView}
          className="flex-1 h-11 rounded-2xl bg-[var(--color-primary)] text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20 hover:opacity-95 transition-all active:scale-[0.98]"
        >
          <Eye size={15} />
          View Report
        </button>

        {/* Download */}
        {/* <button
          onClick={
            handleDownload
          }
          disabled={
            loadingDownload
          }
          className="w-11 h-11 rounded-2xl border border-[var(--color-border)] bg-white flex items-center justify-center hover:border-[var(--color-primary)] transition-all disabled:opacity-60"
        >
          {loadingDownload ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Download
              size={16}
            />
          )}
        </button> */}
      </div>
    </motion.div>
  );
};

export default ReportCard;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
