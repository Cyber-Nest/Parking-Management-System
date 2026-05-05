"use client";
import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Lock,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types & Dummy Data
const INITIAL_DATA = [
  {
    id: "OF-1001",
    name: "John Smith",
    email: "john.smith@parking.com",
    phone: "+1234567890",
    role: "Officer",
    status: "Active",
    tickets: 156,
    date: "May 21, 2025",
    time: "09:15 AM",
  },
  {
    id: "OF-1002",
    name: "Sarah Wright",
    email: "sarah.w@parking.com",
    phone: "+1987654321",
    role: "Supervisor",
    status: "Active",
    tickets: 92,
    date: "May 21, 2025",
    time: "10:30 AM",
  },
  {
    id: "OF-1003",
    name: "Adam Milner",
    email: "adam.m@parking.com",
    phone: "+1555012345",
    role: "Officer",
    status: "Inactive",
    tickets: 210,
    date: "May 20, 2025",
    time: "11:45 AM",
  },
];

export default function OfficerManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const filteredOfficers = useMemo(() => {
    return INITIAL_DATA.filter((officer) => {
      const matchesSearch =
        officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" || officer.status === statusFilter;
      const matchesRole =
        roleFilter === "All Roles" || officer.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [searchQuery, statusFilter, roleFilter]);

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setRoleFilter("All Roles");
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] px-4 md:px-4 lg:px-4 overflow-hidden">
      {/* Overlay for Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsFormOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Add Officer Drawer*/}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-[var(--color-surface)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-[var(--color-border)] ${isFormOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-soft)]">
            <div>
              <h2 className="text-xl font-bold">Add Officer</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Register a new enforcement officer
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-[var(--color-border)]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Email / Login
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="w-20 px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] flex items-center text-sm font-medium">
                  +1
                </div>
                <input
                  type="text"
                  placeholder="Phone number"
                  className="input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Role
              </label>
              <select className="input">
                <option>Select role</option>
                <option>Officer</option>
                <option>Supervisor</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3 block">
                Set Password
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="pass"
                    className="mt-1 accent-[var(--color-primary)]"
                    defaultChecked
                  />
                  <span className="text-sm">
                    <span className="block font-bold">
                      Send invite link to email
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Officer will set their own password via email
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--color-border)] flex gap-3 bg-[var(--color-surface-soft)]">
            <button
              onClick={() => setIsFormOpen(false)}
              className="flex-1 px-4 py-2.5 font-bold text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-white"
            >
              Cancel
            </button>
            <button className="flex-2 btn-primary flex items-center justify-center gap-2 px-6">
              <UserPlus size={18} /> Create Officer
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Officer{" "}
            <span className="text-[var(--color-primary)]">Management</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Manage officers who issue penalty tickets and enforce rules.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-lg shadow-[var(--color-primary)]/20"
        >
          <Plus size={18} /> Add Officer
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<Users size={24} className="text-purple-600" />}
          title="Total Officers"
          value="24"
          subValue="All registered"
          trend="Active now"
          trendUp
        />
        <StatCard
          icon={<UserCheck size={24} className="text-emerald-500" />}
          title="Active Officers"
          value="20"
          subValue="Currently active"
        />
        <StatCard
          icon={<UserX size={24} className="text-rose-500" />}
          title="Disabled Officers"
          value="3"
          subValue="Cannot login"
        />
        <StatCard
          icon={<Ticket size={24} className="text-blue-600" />}
          title="Tickets Issued Today"
          value="68"
          subValue="By all officers"
          trend="+14% vs avg"
          trendUp
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] mb-6 flex flex-wrap items-center gap-4 border border-[var(--color-border)]">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Officer..."
            className="input pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="input w-auto text-xs font-bold"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select
          className="input w-auto text-xs font-bold"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option>All Roles</option>
          <option>Officer</option>
          <option>Supervisor</option>
        </select>
        <button
          onClick={handleReset}
          className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-black tracking-widest">
                <th className="px-6 py-5">Officer ID</th>
                <th className="px-6 py-5">Officer Details</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Tickets Issued</th>
                <th className="px-6 py-5">Last Login</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {filteredOfficers.map((officer, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[var(--color-surface-soft)]/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                    {officer.id}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                        <img
                          src={`https://i.pravatar.cc/150?u=${idx}`}
                          alt="avatar"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[var(--color-text-primary)] text-sm">
                          {officer.name}
                        </span>
                        <span className="text-[11px] text-[var(--color-primary)] font-semibold mt-0.5">
                          {officer.email}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-bold">
                          {officer.phone}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100 uppercase">
                      {officer.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${officer.status === "Active" ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-orange-100 text-orange-600"}`}
                    >
                      {officer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-black text-center text-sm">
                    {officer.tickets}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-[11px] font-bold">{officer.date}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      {officer.time}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <ActionButton icon={<Eye size={14} />} />
                      <ActionButton icon={<Edit2 size={14} />} />
                      <ActionButton
                        icon={<Lock size={14} />}
                        color="var(--color-accent)"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-4 bg-[var(--color-surface-soft)]/30 border-t border-[var(--color-border)] flex items-center justify-between">
          <p className="text-[12px] font-bold text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="text-[var(--color-text-primary)]">
              1 to {filteredOfficers.length}
            </span>{" "}
            of 24 officers
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-white text-xs font-black shadow-lg shadow-[var(--color-primary)]/20">
              1
            </button>
            <button className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-Components
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

function ActionButton({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      className="p-2 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
      style={{ color: color || "var(--color-primary)" }}
    >
      {icon}
    </button>
  );
}
