"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

interface PlanFormData {
  name: string;
  type: string;
  duration: string;
  price: string;
  tax: string;
  status: string;
  parkingLotId?: string;
}

interface RuleFormData {
  violation: string;
  code: string;
  amount: string;
  grace: string;
  description: string;
  status: string;
}

interface ParkingPlanAndRulesFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  activeTab: string;
  editingItem: any;
  planForm: PlanFormData;
  ruleForm: RuleFormData;
  parkingLots?: Array<{ id: string; lot_name: string }>;
  onPlanChange: (data: PlanFormData) => void;
  onRuleChange: (data: RuleFormData) => void;
}

export const ParkingPlanAndRulesFormDrawer = ({
  isOpen,
  onClose,
  parkingLots,
  onSubmit,
  activeTab,
  editingItem,
  planForm,
  ruleForm,
  onPlanChange,
  onRuleChange,
}: ParkingPlanAndRulesFormDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPlan = activeTab === "plans";

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[var(--color-surface)] shadow-2xl z-50 border-l border-[var(--color-border)]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-soft)]">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingItem ? "Edit" : "Add"} {isPlan ? "Plan" : "Rule"}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Configure settings
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {isPlan ? (
                  <>
                    <input
                      placeholder="Plan Name"
                      className="input"
                      value={planForm.name}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, name: e.target.value })
                      }
                    />
                    <select
                      className="input"
                      value={planForm.type}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, type: e.target.value })
                      }
                    >
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Monthly</option>
                    </select>
                    <select
                      className="input"
                      value={planForm.parkingLotId ?? ""}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, parkingLotId: e.target.value || undefined })
                      }
                    >
                      <option value="">All lots</option>
                      {parkingLots?.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {lot.lot_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      className="input"
                      value={planForm.duration}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, duration: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      className="input"
                      value={planForm.price}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, price: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Tax (%)"
                      className="input"
                      value={planForm.tax}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, tax: e.target.value })
                      }
                    />
                    <select
                      className="input"
                      value={planForm.status}
                      onChange={(e) =>
                        onPlanChange({ ...planForm, status: e.target.value })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      placeholder="Violation"
                      className="input"
                      value={ruleForm.violation}
                      onChange={(e) =>
                        onRuleChange({ ...ruleForm, violation: e.target.value })
                      }
                    />
                    <input
                      placeholder="Code"
                      className="input"
                      value={ruleForm.code}
                      onChange={(e) =>
                        onRuleChange({ ...ruleForm, code: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Fine Amount ($)"
                      className="input"
                      value={ruleForm.amount}
                      onChange={(e) =>
                        onRuleChange({ ...ruleForm, amount: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Grace Period (minutes)"
                      className="input"
                      value={ruleForm.grace}
                      onChange={(e) =>
                        onRuleChange({ ...ruleForm, grace: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Description"
                      className="input min-h-[100px]"
                      value={ruleForm.description}
                      onChange={(e) =>
                        onRuleChange({
                          ...ruleForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <select
                      className="input"
                      value={ruleForm.status}
                      onChange={(e) =>
                        onRuleChange({ ...ruleForm, status: e.target.value })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--color-border)] flex gap-3 bg-[var(--color-surface-soft)]">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 font-bold text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 px-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingItem ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      {editingItem ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
