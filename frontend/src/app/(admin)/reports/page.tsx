"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  TrendingUp,
  Clock,
  ShieldAlert,
  Users,
  Download,
  ArrowRight,
  DollarSign,
  Ticket,
  Car,
  TrendingDown,
  Star,
  FileBarChart,
  Calendar,
} from "lucide-react";

import ReportCard from "@/components/chart/ReportCardCharts";
import { motion, AnimatePresence } from "framer-motion";

//StatCard
const StatCard = ({ icon, title, value, subValue, trend, trendUp }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-5 bg-white rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--color-primary)]">
        {icon}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
            trendUp
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      )}
    </div>

    <div className="mt-4">
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
        {title}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
          {value}
        </h3>
        {subValue && (
          <span className="text-sm font-bold text-[var(--color-text-secondary)] opacity-70">
            ({subValue})
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("All Reports");

  const tabs = [
    "All Reports",
    "Revenue",
    "Usage",
    "Penalty",
    "Officer",
    "Expiry",
    "Peak Analysis",
  ];

  const reportCategories = [
    {
      id: 1,
      type: "line",
      hasGraph: true,
      tabId: "Revenue",
      title: "Revenue Reports",
      color: "bg-emerald-500",
      icon: <DollarSign />,
      desc: "Track all revenue streams and financial performance over time.",
      features: [
        "Daily Revenue Breakdown",
        "Payment Method Stats",
        "Revenue vs Projection",
      ],
    },
    {
      id: 2,
      type: "bar",
      hasGraph: true,
      tabId: "Usage",
      title: "Parking Usage",
      color: "bg-blue-500",
      icon: <Car />,
      desc: "Analyze parking sessions and utilization trends in real-time.",
      features: [
        "Active Session Count",
        "Duration Analysis",
        "Lot Occupancy Rates",
      ],
    },
    {
      id: 3,
      type: "pie",
      hasGraph: true,
      tabId: "Penalty",
      title: "Penalty Analytics",
      color: "bg-orange-500",
      icon: <ShieldAlert />,
      desc: "Monitor tickets, violations and penalty collections efficiency.",
      features: [
        "Paid vs Unpaid Tickets",
        "Violation Distribution",
        "Collection Status",
      ],
    },
    {
      id: 4,
      type: "bar",
      hasGraph: false,
      tabId: "Officer",
      title: "Officer Performance",
      color: "bg-purple-500",
      icon: <Users />,
      desc: "Evaluate officer activity and enforcement status across zones.",
      features: [
        "Tickets Per Officer",
        "Efficiency Rating",
        "Top Performing Teams",
        "Fine Generation Rate",
      ],
    },
    {
      id: 5,
      type: "heatmap",
      hasGraph: true,
      tabId: "Peak Analysis",
      title: "Peak Time Analysis",
      color: "bg-rose-500",
      icon: <TrendingUp />,
      desc: "Identify peak hours and busiest days for better planning.",
      features: ["Hourly Occupancy", "Heatmap Trends", "Busiest Zone ID"],
    },
    {
      id: 6,
      type: "line",
      hasGraph: false,
      tabId: "Expiry",
      title: "Expiry Alerts",
      color: "bg-indigo-500",
      icon: <Clock />,
      desc: "Overview of expired sessions and overstay patterns in city.",
      features: [
        "Overstay Duration",
        "Alert Response Time",
        "Fine Generation Rate",
        "Fine Generation Rate",
      ],
    },
  ];
  return (
    <div className="min-h-screen px-4 md:px-4">
      {/* Header - Synced with Ticket Page */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        {/* <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics &{" "}
            <span className="text-[var(--color-primary)]">Reports</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Deep dive into performance data and analytical insights
          </p>
        </div> */}
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Analytics &{" "}
            <span className="text-[var(--color-primary)]">Reports</span>
          </h1>

          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Deep dive into performance data and analytical insights
          </p>
        </div>
      </header>

      {/* Stats - Synced with Ticket Page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<DollarSign size={22} />}
          title="Total Revenue"
          value="$45,678"
          trend="12% vs last month"
          trendUp
        />
        <StatCard
          icon={<Car size={22} />}
          title="Active Sessions"
          value="1,240"
          trend="5% decrease"
          trendUp={false}
        />
        <StatCard
          icon={<Ticket size={22} />}
          title="Pending Fines"
          value="142"
          subValue="$7.1k"
        />
        <StatCard
          icon={<FileBarChart size={22} />}
          title="Reports Generated"
          value="84"
          trend="New record"
          trendUp
        />
      </div>

      {/* Tab Bar */}
      <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-8">
        <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "All Reports" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {reportCategories.map((report) => (
                <ReportCard
                  key={report.id}
                  id={report.id}
                  type={report.type}
                  hasGraph={report.hasGraph}
                  title={report.title}
                  desc={report.desc}
                  icon={report.icon}
                  color={report.color}
                  features={report.features}
                  onClick={() => setActiveTab(report.tabId)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white py-32 rounded-[40px] border border-[var(--color-border)] shadow-[var(--shadow-card)] text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutGrid
                  size={32}
                  className="text-[var(--color-primary)] opacity-40"
                />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {activeTab} Detailed View
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mt-2 max-w-xs mx-auto">
                Detailed analytical dashboard for this module is being
                synchronized with live data.
              </p>
              <button
                onClick={() => setActiveTab("All Reports")}
                className="mt-8 text-xs font-bold text-white bg-[var(--color-primary)] px-8 py-3 rounded-xl uppercase tracking-wider shadow-lg hover:opacity-90 transition-all"
              >
                Back to Overview
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
