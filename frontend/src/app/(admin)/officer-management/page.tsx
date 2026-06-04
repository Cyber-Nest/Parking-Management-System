"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  Search,
  RotateCcw,
  Users,
  UserCheck,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Ban,
  ShieldAlert,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ViewOfficerDrawer } from "@/components/officer-management/ViewOfficerDrawer";
import {
  OfficerFormDrawer,
  OfficerFormData,
} from "@/components/officer-management/OfficerFormDrawer";
import { officerService, Officer } from "@/services/officer.service";
import { createOfficer, updateOfficer } from "@/services/officers.service";

const initialFormData: OfficerFormData = {
  countryCode: "+1",
  name: "",
  email: "",
  phone: "",
  role: "",
  employeeId: "",
  employmentType: "",
  hireDate: "",
  emergencyContactName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
  addressStreet: "",
  addressCity: "",
  addressProvince: "",
  addressPostalCode: "",
  profilePhoto: null,
};

export default function OfficerManagementPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<OfficerFormData>(initialFormData);

  const itemsPerPage = 10;

  // Fetch Data
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        const items = await officerService.getOfficers();
        setOfficers(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  // Stats
  const stats = useMemo(() => {
    return {
      totalOfficers: officers.length,
      activeOfficers: officers.filter((o) => o.accessStatus === "Enabled")
        .length,
      disabledOfficers: officers.filter((o) => o.accessStatus === "Disabled")
        .length,
      totalTickets: officers.reduce(
        (acc, curr) => acc + (curr.tickets ?? 0),
        0,
      ),
    };
  }, [officers]);

  // Filters
  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const matchesSearch =
        officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status"
          ? true
          : officer.accessStatus === statusFilter;
      const matchesRole =
        roleFilter === "All Roles" ? true : officer.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [officers, searchQuery, statusFilter, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);
  const paginatedOfficers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOfficers.slice(start, start + itemsPerPage);
  }, [filteredOfficers, currentPage]);

  // Form
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingOfficer(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormData({
      countryCode: "+1",
      name: officer.name || "",
      email: officer.email || "",
      phone: officer.phone || "",
      role:
        officer.role === "SUPERVISOR"
          ? "Supervisor"
          : officer.role === "OFFICER"
            ? "Officer"
            : officer.role === "Admin" || officer.role === "ADMIN"
              ? "Admin"
              : "Officer",
      employeeId: officer.employeeId || officer.id || "",
      employmentType: officer.employmentType || "",
      hireDate: officer.hireDate || "",
      emergencyContactName: officer.emergencyContactName || "",
      emergencyPhone: officer.emergencyPhone || "",
      emergencyRelationship: officer.emergencyRelationship || "",
      addressStreet: officer.addressStreet || "",
      addressCity: officer.addressCity || "",
      addressProvince: officer.addressProvince || "",
      addressPostalCode: officer.addressPostalCode || "",
      profilePhoto: officer.profilePhoto || null,
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (field: keyof OfficerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewOfficer = (officer: Officer) => {
    setSelectedOfficer(officer);
    setIsViewDrawerOpen(true);
  };

  const handleDisableOfficer = async (officerId: string) => {
    try {
      const newStatus =
        officers.find((o) => o.id === officerId)?.accessStatus === "Disabled"
          ? "ACTIVE"
          : "DISABLED";
      await officerService.setOfficerStatus(officerId, newStatus);
      // Refresh the list
      const items = await officerService.getOfficers();
      setOfficers(items);
      toast.success(
        `Officer ${newStatus === "DISABLED" ? "disabled" : "enabled"} successfully`,
      );
    } catch (error) {
      console.error(error);
      const msg =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response?.data?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to update officer status";
      toast.error(msg);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setRoleFilter("All Roles");
    setCurrentPage(1);
  };

  const mapRole = (r: string): "OFFICER" | "SUPERVISOR" => {
    if (r === "Supervisor") return "SUPERVISOR";
    return "OFFICER";
  };

  const handleSubmitOfficer = async (data: OfficerFormData) => {
    if (!data.name || !data.email || !data.phone || !data.role) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingOfficer) {
        await updateOfficer(editingOfficer.id, {
          full_name: data.name,
          phone: data.phone,
          role: mapRole(data.role),
          badge_number: data.employeeId || undefined,
        });
        toast.success("Officer updated");
      } else {
        await createOfficer({
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          role: mapRole(data.role),
          badge_number: data.employeeId || undefined,
        });
        toast.success("Officer created");
      }
      const items = await officerService.getOfficers();
      setOfficers(items);
      setIsFormOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
      const msg =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (e as { response: { data: { message: string } } }).response.data
              .message
          : "Could not save officer";
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-[var(--color-bg)] px-4 md:px-4 lg:px-4 overflow-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 ">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
              Officer{" "}
              <span className="text-[var(--color-primary)]">Management</span>
            </h1>

            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
              Manage officers who issue penalty tickets and enforce rules.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={18} /> Add Officer
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<Users size={24} className="text-purple-600" />}
            title="Total Officers"
            value={stats.totalOfficers}
            subValue="All registered"
          />
          <StatCard
            icon={<UserCheck size={24} className="text-emerald-500" />}
            title="Online Officers"
            value={stats.activeOfficers}
            subValue="Currently logged in"
          />
          <StatCard
            icon={<ShieldAlert size={24} className="text-red-500" />}
            title="Disabled Officers"
            value={stats.disabledOfficers}
            subValue="Access blocked"
          />
          <StatCard
            icon={<Ticket size={24} className="text-blue-600" />}
            title="Tickets Issued"
            value={stats.totalTickets}
            subValue="By all officers"
          />
        </div>

        {/* Filters */}
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
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
          <select
            className="input w-auto text-xs font-bold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All Roles</option>
            <option>OFFICER</option>
            <option>SUPERVISOR</option>
          </select>
          <button
            onClick={handleResetFilters}
            className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
                <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-black tracking-widest">
                  <th className="px-6 py-5">Officer ID</th>
                  <th className="px-6 py-5">Officer Details</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Login Status</th>
                  <th className="px-6 py-5">Access</th>
                  <th className="px-6 py-5 text-center">Tickets</th>
                  <th className="px-6 py-5">Last Login</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
                {loading ? (
                  <TableSkeleton rows={5} cols={8} />
                ) : paginatedOfficers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-sm font-semibold text-gray-400"
                    >
                      No officers found.
                    </td>
                  </tr>
                ) : (
                  paginatedOfficers.map((officer, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                    >
                      <td
                        className="px-6 py-4 font-bold text-[var(--color-primary)]"
                        title={officer.id}
                      >
                        {truncateId(officer.id)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                            {officer.profilePhoto ? (
                              <img
                                src={officer.profilePhoto}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-slate-700 uppercase">
                                {officer.name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-sm">
                              {officer.name}
                            </div>
                            <div className="text-[11px] text-[var(--color-primary)] font-semibold">
                              {officer.email}
                            </div>
                            <div className="text-[10px] text-[var(--color-text-muted)]">
                              {officer.phone}
                            </div>
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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${officer.loginStatus === "Active" ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-orange-100 text-orange-600"}`}
                        >
                          {officer.loginStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${officer.accessStatus === "Enabled" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
                        >
                          {officer.accessStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-center">
                        {officer.tickets}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-bold">
                          {officer.date}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">
                          {officer.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <OfficerActionDropdown
                          officer={officer}
                          onView={handleViewOfficer}
                          onEdit={openEditForm}
                          onDisable={handleDisableOfficer}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-[var(--color-surface-soft)]/30 border-t border-[var(--color-border)] flex items-center justify-between">
            <p className="text-[12px] font-bold text-[var(--color-text-secondary)]">
              Showing{" "}
              <span className="text-[var(--color-text-primary)]">
                {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOfficers.length)}
              </span>{" "}
              of {filteredOfficers.length} officers
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-white transition-all disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                        : "hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-white transition-all disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Officer Drawer */}
      <ViewOfficerDrawer
        isOpen={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        officer={selectedOfficer}
      />

      {/* Add/Edit Officer Form Drawer */}
      <OfficerFormDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmitOfficer}
        editingOfficer={editingOfficer}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </>
  );
}

// Dropdown component
type OfficerActionDropdownType = {
  officer: Officer;
  onView: (officer: Officer) => void;
  onEdit: (officer: Officer) => void;
  onDisable: (officerId: string) => void;
};

function OfficerActionDropdown({
  officer,
  onView,
  onEdit,
  onDisable,
}: OfficerActionDropdownType) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div
      className="relative flex justify-center overflow-visible"
      ref={menuRef}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-all active:scale-95"
      >
        <MoreVertical
          size={16}
          className="sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 sm:top-12 z-50 w-48 sm:w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
          >
            <button
              onClick={() => {
                onView(officer);
                setOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-all text-[var(--color-text-primary)]"
            >
              <Eye size={15} className="sm:w-[15px] sm:h-[15px]" /> View Officer
            </button>
            <button
              onClick={() => {
                onEdit(officer);
                setOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-all text-[var(--color-text-primary)]"
            >
              <Edit2 size={15} className="sm:w-[15px] sm:h-[15px]" /> Edit
              Officer
            </button>
            <button
              onClick={() => {
                onDisable(officer.id);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
            >
              <Ban size={15} className="sm:w-[15px] sm:h-[15px]" />{" "}
              {officer.accessStatus === "Disabled"
                ? "Enable Officer"
                : "Disable Officer"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
