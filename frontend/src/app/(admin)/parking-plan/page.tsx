"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  ShieldAlert,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listParkingPlans } from "@/services/parkingPlans.service";

//StatCard
const StatCard = ({ icon, title, value, subValue, trend, trendUp }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-5 bg-white rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
        >
          {trendUp ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingUp size={12} className="rotate-180" />
          )}
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

//Action Button
function ActionBtn({ icon, color, variant = "default", onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl border border-[var(--color-border)] bg-white hover:shadow-sm transition-all group ${variant === "danger" ? "hover:border-red-200" : "hover:border-[var(--color-primary-light)]"}`}
      style={{
        color:
          variant === "danger" ? "#EF4444" : color || "var(--color-primary)",
      }}
    >
      <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 15 })}
      </div>
    </button>
  );
}

export default function ParkingSettingsPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab !== "plans") return;
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const res = await listParkingPlans();
        if (!isMounted) return;
        setPlans(res?.data ?? []);
      } catch (e) {
        console.error("[ParkingSettingsPage] load plans failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchPlans();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const tableRows = useMemo(() => {
    if (activeTab !== "plans") return [];
    return isLoading ? [] : plans;
  }, [activeTab, isLoading, plans]);

  return (
    <div className="min-h-screen px-3 md:px-4 lg:px-4 bg-[var(--color-bg)]">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Parking{" "}
            <span className="text-[var(--color-primary)]">Settings</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Manage rates, durations, and violation penalty rules
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 self-start md:self-center"
        >
          <Plus size={18} />{" "}
          {activeTab === "plans" ? "Add New Plan" : "Add New Rule"}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeTab === "plans" ? (
          <>
            <StatCard
              icon={<LayoutGrid size={22} className="text-emerald-500" />}
              title="Total Plans"
              value={String(plans.length)}
              trend="Loaded from API"
              trendUp
            />
            <StatCard
              icon={<CheckCircle2 size={22} className="text-blue-500" />}
              title="Active Plans"
              value="5"
            />
            <StatCard
              icon={<XCircle size={22} className="text-orange-500" />}
              title="Inactive Plans"
              value="1"
            />
            <StatCard
              icon={<CreditCard size={22} className="text-purple-500" />}
              title="Tax Rate"
              value="5.0%"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<ShieldAlert size={22} className="text-red-500" />}
              title="Total Rules"
              value="5"
            />
            <StatCard
              icon={<CheckCircle2 size={22} className="text-blue-500" />}
              title="Active Rules"
              value="5"
            />
            <StatCard
              icon={<Clock size={22} className="text-amber-500" />}
              title="Grace Period"
              value="10 min"
            />
            <StatCard
              icon={<TrendingUp size={22} className="text-indigo-500" />}
              title="Avg Fine"
              value="$45.00"
            />
          </>
        )}
      </div>

      {/* Tabs & Search Row */}
      <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)]">
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${activeTab === "plans" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)]"}`}
              >
                Parking Plans
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${activeTab === "rules" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)]"}`}
              >
                Penalty Rules
              </button>
            </div>

            <div className="flex-1 max-w-md relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={18}
              />
              <input
                type="text"
                placeholder={
                  activeTab === "plans" ? "Search plans..." : "Search rules..."
                }
                className="input pl-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)] mb-10">
        <div className="no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.table
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="w-full text-left border-collapse min-w-[900px]"
            >
              <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
                <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                  <th className="px-6 py-5">
                    {activeTab === "plans" ? "Plan ID" : "Rule ID"}
                  </th>
                  <th className="px-6 py-5">
                    {activeTab === "plans" ? "Plan Details" : "Violation Type"}
                  </th>
                  <th className="px-6 py-5">
                    {activeTab === "plans" ? "Duration" : "Penalty Amount"}
                  </th>
                  <th className="px-6 py-5">
                    {activeTab === "plans" ? "Price" : "Grace Period"}
                  </th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Last Updated</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
                {(activeTab === "plans" ? tableRows : [1, 2, 3, 4, 5]).map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                      {activeTab === "plans" ? item.id : `PEN-40${idx}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--color-text-primary)]">
                        {activeTab === "plans"
                          ? item.name
                          : "Expired Parking"}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)]">
                        {activeTab === "plans"
                          ? "Type: Plan"
                          : "Violation Code: EXP-01"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {activeTab === "plans" ? `${item.duration} mins` : "$50.00"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black">
                        {activeTab === "plans" ? `$${Number(item.price ?? 0).toFixed(2)}` : "10 mins"}
                      </div>
                      {activeTab === "plans" && (
                        <div className="text-[10px] text-emerald-500 font-bold">
                          Tax Included
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-100 text-emerald-600">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">May 21, 2025</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] font-bold">
                        10:30 AM
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <ActionBtn icon={<Edit2 />} />
                        <ActionBtn icon={<Trash2 />} variant="danger" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </AnimatePresence>
        </div>

        {/*Added Pagination */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="text-[var(--color-text-primary)] font-bold">
              1 to 6
            </span>{" "}
            of {activeTab === "plans" ? `${plans.length} plans` : "5 rules"}
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-full hover:bg-white border border-[var(--color-border)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
              <ChevronLeft size={16} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-xs font-bold shadow-md shadow-[var(--color-primary)]/20">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
              3
            </button>
            <button className="p-2 rounded-full hover:bg-white border border-[var(--color-border)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Plan/Rule Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-[var(--color-surface)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-[var(--color-border)] ${isFormOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-soft)]">
            <div>
              <h2 className="text-xl font-bold">
                {activeTab === "plans" ? "Add New Plan" : "Add Penalty Rule"}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {activeTab === "plans"
                  ? "Set up new parking rates"
                  : "Define new violation fines"}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 hover:bg-white rounded-full transition-colors border border-[var(--color-border)]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
            {activeTab === "plans" ? (
              /*PARKING PLAN FIELDS*/
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly VIP Pass"
                    className="input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Plan Type
                  </label>
                  <select className="input">
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Price ($)
                    </label>
                    <input type="number" placeholder="0.00" className="input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Duration (Mins)
                    </label>
                    <input type="number" placeholder="60" className="input" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Tax Rate (%)
                  </label>
                  <input type="number" placeholder="5.0" className="input" />
                </div>
              </>
            ) : (
              /* PENALTY RULE FIELDS*/
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Violation Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Double Parking"
                    className="input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Violation Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DP-001"
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Fine Amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder="50.00"
                      className="input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Grace Period (Min)
                    </label>
                    <input type="number" placeholder="10" className="input" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Description
                  </label>
                  <textarea
                    placeholder="Explain the violation rule..."
                    className="input min-h-[80px] py-2"
                  />
                </div>
              </>
            )}

            {/* Common Status Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Status
              </label>
              <select className="input">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3 block">
                Settings
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  className="accent-[var(--color-primary)] w-4 h-4"
                  defaultChecked
                />
                <span className="text-xs font-bold">
                  {activeTab === "plans"
                    ? "Enable for mobile app"
                    : "Alert officer on violation"}
                </span>
              </label>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-[var(--color-border)] flex gap-3 bg-[var(--color-surface-soft)]">
            <button
              onClick={() => setIsFormOpen(false)}
              className="flex-1 px-4 py-2.5 font-bold text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button className="flex-2 btn-primary flex items-center justify-center gap-2 px-6">
              <Plus size={18} />{" "}
              {activeTab === "plans" ? "Create Plan" : "Set Rule"}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
