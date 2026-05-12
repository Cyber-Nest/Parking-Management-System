"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getTokenValue } from "@/lib/axios";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ActionButton } from "@/components/common/ActionButton";
import { ParkingPlanAndRulesFormDrawer } from "@/components/parking-plan/ParkingPlanAndRulesFormDrawer";

import {
  ParkingPlan,
  parkingPlanAndRulesService,
  PenaltyRule,
} from "@/services/parkingPlanAndRules.service";
import toast from "react-hot-toast";

interface PlanForm {
  name: string;
  type: string;
  duration: string;
  price: string;
  tax: string;
  status: string;
}

interface RuleForm {
  violation: string;
  code: string;
  amount: string;
  grace: string;
  description: string;
  status: string;
}

export default function ParkingPlanAndRulesPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null);
  const [plans, setPlans] = useState<ParkingPlan[]>([]);
  const [rules, setRules] = useState<PenaltyRule[]>([]);

  const [planForm, setPlanForm] = useState<PlanForm>({
    name: "",
    type: "Hourly",
    duration: "",
    price: "",
    tax: "",
    status: "Active",
  });

  const [ruleForm, setRuleForm] = useState<RuleForm>({
    violation: "",
    code: "",
    amount: "",
    grace: "",
    description: "",
    status: "Active",
  });

  const itemsPerPage = 10; //table 10 items per page

  const router = useRouter();

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const token = getTokenValue("token");
      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const [plansRes, rulesRes] = await Promise.all([
          parkingPlanAndRulesService.getPlans(),
          parkingPlanAndRulesService.getRules(),
        ]);
        setPlans(plansRes);
        setRules(rulesRes);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalPlans: plans.length,
      activePlans: plans.filter((p) => p.status === "Active").length,
      inactivePlans: plans.filter((p) => p.status === "Inactive").length,
      totalRules: rules.length,
      activeRules: rules.filter((r) => r.status === "Active").length,
    };
  }, [plans, rules]);

  // Filter Data
  const filteredData = useMemo(() => {
    const data = activeTab === "plans" ? plans : rules;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.filter((item: any) => {
      const query = search.toLowerCase();
      if (activeTab === "plans") {
        return (
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query)
        );
      }
      return (
        item.violation.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
      );
    });
  }, [search, activeTab, plans, rules]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset Form
  const resetForm = () => {
    setEditingItem(null);
    setPlanForm({
      name: "",
      type: "Hourly",
      duration: "",
      price: "",
      tax: "",
      status: "Active",
    });
    setRuleForm({
      violation: "",
      code: "",
      amount: "",
      grace: "",
      description: "",
      status: "Active",
    });
    setIsFormOpen(false);
  };

  // Submit Handler
  const handleSubmit = () => {
    if (activeTab === "plans") {
      if (!planForm.name || !planForm.price) {
        toast.error("Please fill all fields");
        return;
      }

      const newPlan: ParkingPlan = {
        id: editingItem ? editingItem.id : `PLAN-${100 + plans.length + 1}`,
        name: planForm.name,
        type: planForm.type,
        duration: Number(planForm.duration),
        price: Number(planForm.price),
        tax: Number(planForm.tax),
        status: planForm.status as "Active" | "Inactive",
        updatedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        updatedTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (editingItem) {
        setPlans((prev) =>
          prev.map((item) => (item.id === editingItem.id ? newPlan : item)),
        );
        toast.success("Plan updated successfully");
      } else {
        setPlans((prev) => [newPlan, ...prev]);
        toast.success("Plan added successfully");
      }
    } else {
      if (!ruleForm.violation || !ruleForm.amount) {
        toast.error("Please fill all fields");
        return;
      }

      const newRule: PenaltyRule = {
        id: editingItem ? editingItem.id : `PEN-${400 + rules.length + 1}`,
        violation: ruleForm.violation,
        code: ruleForm.code,
        amount: Number(ruleForm.amount),
        grace: Number(ruleForm.grace),
        description: ruleForm.description,
        status: ruleForm.status as "Active" | "Inactive",
        updatedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        updatedTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (editingItem) {
        setRules((prev) =>
          prev.map((item) => (item.id === editingItem.id ? newRule : item)),
        );
        toast.success("Rule updated successfully");
      } else {
        setRules((prev) => [newRule, ...prev]);
        toast.success("Rule added successfully");
      }
    }
    resetForm();
  };

  // Edit Handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === "plans") {
      setPlanForm({
        name: item.name,
        type: item.type,
        duration: item.duration.toString(),
        price: item.price.toString(),
        tax: item.tax.toString(),
        status: item.status,
      });
    } else {
      setRuleForm({
        violation: item.violation,
        code: item.code,
        amount: item.amount.toString(),
        grace: item.grace.toString(),
        description: item.description,
        status: item.status,
      });
    }
    setIsFormOpen(true);
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    if (activeTab === "plans") {
      setPlans((prev) => prev.filter((item) => item.id !== id));
    } else {
      setRules((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    if (activeTab === "plans") {
      setPlans((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
            : item,
        ),
      );
    } else {
      setRules((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
            : item,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen px-3 md:px-4 lg:px-4 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        {/* <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Parking{" "}
            <span className="text-[var(--color-primary)]">Settings</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Manage rates, durations, and violation penalty rules
          </p>
        </div> */}
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Parking{" "}
            <span className="text-[var(--color-primary)]">Settings</span>
          </h1>

          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Manage rates, durations, and violation penalty rules
          </p>
        </div>

        <button></button>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
        >
          <Plus size={18} />
          {activeTab === "plans" ? "Add New Plan" : "Add New Rule"}
        </button>
      </header>

      {/* Stats  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeTab === "plans" ? (
          <>
            <StatCard
              icon={<LayoutGrid size={22} className="text-emerald-500" />}
              title="Total Plans"
              value={stats.totalPlans}
            />
            <StatCard
              icon={<CheckCircle2 size={22} className="text-blue-500" />}
              title="Active Plans"
              value={stats.activePlans}
            />
            <StatCard
              icon={<XCircle size={22} className="text-orange-500" />}
              title="Inactive Plans"
              value={stats.inactivePlans}
            />
            <StatCard
              icon={<CreditCard size={22} className="text-purple-500" />}
              title="Tax Rate"
              value="5%"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<ShieldAlert size={22} className="text-red-500" />}
              title="Total Rules"
              value={stats.totalRules}
            />
            <StatCard
              icon={<CheckCircle2 size={22} className="text-blue-500" />}
              title="Active Rules"
              value={stats.activeRules}
            />
            <StatCard
              icon={<Clock size={22} className="text-amber-500" />}
              title="Grace Period"
              value="10 Min"
            />
            <StatCard
              icon={<TrendingUp size={22} className="text-indigo-500" />}
              title="Avg Fine"
              value="$45"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)]">
            <button
              onClick={() => {
                setActiveTab("plans");
                setCurrentPage(1);
                setSearch("");
              }}
              className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${activeTab === "plans"
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
                }`}
            >
              Parking Plans
            </button>
            <button
              onClick={() => {
                setActiveTab("rules");
                setCurrentPage(1);
                setSearch("");
              }}
              className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${activeTab === "rules"
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
                }`}
            >
              Penalty Rules
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-[280px]">
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
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="p-2.5 rounded-xl border border-[var(--color-border)] hover:bg-white transition-all"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)] mb-10">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                <th className="px-6 py-5">ID</th>
                <th className="px-6 py-5">Details</th>
                <th className="px-6 py-5">Duration / Fine</th>
                <th className="px-6 py-5">Price / Grace</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Updated</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-sm font-semibold text-gray-400"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paginatedData.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                      {item.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--color-text-primary)]">
                        {activeTab === "plans" ? item.name : item.violation}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)]">
                        {activeTab === "plans"
                          ? `Type: ${item.type}`
                          : `Code: ${item.code}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {activeTab === "plans"
                        ? `${item.duration} mins`
                        : `$${item.amount}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black">
                        {activeTab === "plans"
                          ? `$${item.price}`
                          : `${item.grace} mins`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${item.status === "Active"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-orange-100 text-orange-600"
                          }`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.updatedDate}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] font-bold">
                        {item.updatedTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <ActionButton
                          icon={<Edit2 />}
                          onClick={() => handleEdit(item)}
                        />
                        <ActionButton
                          icon={<Trash2 />}
                          variant="danger"
                          onClick={() => handleDelete(item.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="font-bold text-[var(--color-text-primary)]">
              {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            of {filteredData.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 rounded-full border border-[var(--color-border)] hover:bg-white transition-all disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${currentPage === page
                      ? "bg-[var(--color-primary)] text-white"
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
              className="p-2 rounded-full border border-[var(--color-border)] hover:bg-white transition-all disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Parking Plan and Rules Drawer */}
      <ParkingPlanAndRulesFormDrawer
        isOpen={isFormOpen}
        onClose={resetForm}
        onSubmit={handleSubmit}
        activeTab={activeTab}
        editingItem={editingItem}
        planForm={planForm}
        ruleForm={ruleForm}
        onPlanChange={setPlanForm}
        onRuleChange={setRuleForm}
      />
    </div>
  );
}
