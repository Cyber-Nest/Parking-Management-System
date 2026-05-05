"use client";
import React, { useState } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  FileText,
  Download,
  Star,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MiniStatProps {
  label: string;
  value: string;
  trend?: string;
  subLabel?: string;
  color?: string;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("All Reports");

  const reportTabs = [
    { id: "All Reports", icon: <BarChart3 size={16} /> },
    { id: "Revenue", icon: <DollarSign size={16} /> },
    { id: "Parking Usage", icon: <Clock size={16} /> },
    { id: "Penalty", icon: <ShieldCheck size={16} /> },
    { id: "Officer", icon: <Users size={16} /> },
    { id: "Financial", icon: <TrendingUp size={16} /> },
    { id: "Operations", icon: <FileText size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 md:px-4 lg:px-6 font-sans">
      {/*Top Header*/}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Reports <span className="text-[var(--color-primary)]">Center</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Powerful insights and analytics for better parking management
            decisions.
          </p>
        </div>
      </header>

      {/*Stats Overview Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        <MiniStat
          label="Total Revenue"
          value="$45,678.50"
          trend="+18.6%"
          color="text-[var(--color-success)]"
        />
        <MiniStat
          label="Parking Revenue"
          value="$32,450.00"
          trend="+15.3%"
          color="text-[var(--color-primary)]"
        />
        <MiniStat
          label="Penalty Revenue"
          value="$11,230.00"
          trend="+24.7%"
          color="text-[var(--color-accent)]"
        />
        <MiniStat
          label="Total Sessions"
          value="6,782"
          trend="+12.8%"
          color="text-purple-600"
        />
        <MiniStat
          label="Total Tickets"
          value="1,243"
          trend="+20.1%"
          color="text-orange-600"
        />
        <MiniStat
          label="Active Officers"
          value="24"
          subLabel="of 28 total"
          color="text-teal-600"
        />
      </div>

      {/*Tabs Navigation */}
      <div className="relative mb-10">
        <div className="flex items-center gap-1 bg-[var(--color-surface-soft)] p-1.5 rounded-2xl border border-[var(--color-border)] overflow-x-auto no-scrollbar shadow-inner">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap z-10 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--color-primary)] rounded-xl shadow-md z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab.icon} {tab.id}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        <ReportCard
          id="01"
          title="Revenue Analysis"
          desc="Monthly revenue streams and financial trends."
          tags={["Revenue Breakdown", "Payment Methods"]}
          chart={<SimpleBarChart color="var(--color-success)" />}
        />

        <ReportCard
          id="02"
          title="Parking Usage"
          desc="Utilization trends and session analytics."
          tags={["Occupancy Rate", "Peak Session Hours"]}
          chart={<SimpleBarChart color="var(--color-primary)" />}
        />

        <ReportCard
          id="03"
          title="Penalty Reports"
          desc="Ticket violation tracking and collection status."
          tags={["Paid vs Unpaid", "Violation Types"]}
          chart={
            <div className="flex justify-center py-4">
              <PieChart
                size={48}
                className="text-[var(--color-accent)] opacity-50"
              />
            </div>
          }
        />

        <ReportCard
          id="04"
          title="Officer Stats"
          desc="Individual performance and enforcement activity."
          tags={["Tickets Issued", "Active Hours"]}
          chart={<SimpleBarChart color="var(--color-info)" />}
        />

        {/* Location Performance*/}
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] md:col-span-2 flex flex-col justify-between hover:shadow-lg transition-all group">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-black text-lg">
                  07
                </div>
                <div>
                  <h3 className="font-black text-base text-[var(--color-text-primary)]">
                    Location Performance
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Revenue comparison across parking zones.
                  </p>
                </div>
              </div>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <LocationRow
                name="Downtown Lot"
                revenue="$18,550"
                sessions="2,345"
                color="bg-teal-500"
              />
              <LocationRow
                name="East Plaza"
                revenue="$12,200"
                sessions="1,120"
                color="bg-blue-500"
              />
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-4">
            <button className="text-[var(--color-primary)] text-xs font-black hover:underline flex items-center gap-1">
              Detailed Analysis <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* Peak Hours*/}
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] md:col-span-2 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 font-black text-lg">
                08
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--color-text-primary)]">
                  Peak Occupancy
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Hourly occupancy and heatmap patterns.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1.5 mt-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 rounded-md transition-opacity hover:opacity-100 cursor-help ${i > 10 && i < 18 ? "bg-[var(--color-accent)]" : "bg-orange-100"}`}
                  style={{ opacity: 0.3 + Math.random() * 0.7 }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-black text-[var(--color-text-muted)] mt-3 px-1 uppercase tracking-widest">
              <span>12 AM</span>
              <span>8 AM</span>
              <span>4 PM</span>
              <span>11 PM</span>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-4">
            <button className="text-[var(--color-primary)] text-xs font-black hover:underline flex items-center gap-1">
              View Heatmap <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MiniStat = ({ label, value, trend, subLabel, color }: MiniStatProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-5 bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-soft)] transition-all flex flex-col justify-between"
  >
    <div>
      <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.15em] mb-1.5">
        {label}
      </p>
      <h4
        className={`text-xl font-black tracking-tight text-[var(--color-text-primary)]`}
      >
        {value}
      </h4>
    </div>

    <div className="mt-4 flex items-center gap-2">
      {trend ? (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100`}
        >
          <TrendingUp size={12} className={color} />
          <span className={`text-[10px] font-black ${color}`}>{trend}</span>
        </div>
      ) : (
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] italic">
          {subLabel}
        </span>
      )}
    </div>
  </motion.div>
);

function ReportCard({ id, title, desc, tags, chart }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-xl transition-all flex flex-col h-full"
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-5">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-surface-soft)] flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-border)] font-black text-sm shadow-sm">
            {id}
          </div>
          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>

        <h3 className="font-black text-base text-[var(--color-text-primary)] mb-1.5">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] mb-5">
          {desc}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 rounded-md bg-[var(--color-surface-soft)] text-[10px] font-bold text-[var(--color-text-muted)] border border-[var(--color-border)]/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">{chart}</div>

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
        <button className="text-[var(--color-primary)] text-xs font-black hover:underline flex items-center gap-1">
          Explore Report <ArrowUpRight size={14} />
        </button>
        <div className="flex gap-1.5">
          <button className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/10 transition-colors">
            <Download size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-amber-500 hover:bg-amber-50 transition-colors">
            <Star size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SimpleBarChart({ color }: { color: string }) {
  return (
    <div className="h-16 w-full flex items-end gap-1.5 px-1">
      {[40, 70, 45, 90, 65, 80, 50, 60, 30, 85].map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%`, backgroundColor: color }}
          className="flex-1 rounded-t-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        ></div>
      ))}
    </div>
  );
}

function LocationRow({ name, revenue, sessions, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-soft)]/50 border border-transparent hover:border-[var(--color-border)] transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-8 rounded-full ${color}`}></div>
        <div>
          <p className="text-xs font-black text-[var(--color-text-primary)]">
            {name}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] font-bold">
            {sessions} sessions
          </p>
        </div>
      </div>
      <div className="text-right font-black text-sm text-[var(--color-text-primary)] tracking-tight">
        {revenue}
      </div>
    </div>
  );
}
