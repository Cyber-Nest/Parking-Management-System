import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  DollarSign,
  Receipt,
  CreditCard,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";

const ViewDetailsDrawer = ({ isOpen, onClose, data }: any) => {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)] sticky top-0">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Revenue Details
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Detailed breakdown of earnings
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Date Section */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border)]">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Report Date
                  </p>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {data.date}
                  </p>
                </div>
              </div>

              {/* Main Metric: Net Revenue Card */}
              <div className="relative overflow-hidden p-6 rounded-2xl bg-[var(--color-primary)]/40 text-white shadow-lg shadow-[var(--color-primary)]/20">
                <TrendingUp className="absolute -right-4 -top-4 w-24 h-24 opacity-20" />
                <p className="text-sm font-medium opacity-90">
                  Total Net Revenue
                </p>
                <h3 className="text-3xl font-black mt-1">
                  ${data.net?.toLocaleString()}
                </h3>
              </div>

              {/* Breakdown Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] px-1 uppercase tracking-widest">
                  Breakdown
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  <StatItem
                    icon={<DollarSign size={18} />}
                    label="Parking Revenue"
                    value={`$${data.parking?.toLocaleString()}`}
                  />
                  <StatItem
                    icon={<Receipt size={18} />}
                    label="Penalty Revenue"
                    value={`$${data.penalty?.toLocaleString()}`}
                  />
                  <StatItem
                    icon={<ArrowDownRight size={18} />}
                    label="Refunds"
                    value={`-$${Math.abs(data.refund || 0).toLocaleString()}`}
                    isNegative
                  />
                  <StatItem
                    icon={<CreditCard size={18} />}
                    label="Total Transactions"
                    value={data.txns}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper Component for Stats
const StatItem = ({ icon, label, value, isNegative = false }: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]">
        {icon}
      </div>
      <span className="text-sm font-medium text-[var(--color-text-muted)]">
        {label}
      </span>
    </div>
    <span
      className={`font-bold ${isNegative ? "text-red-500" : "text-[var(--color-text-primary)]"}`}
    >
      {value}
    </span>
  </div>
);

export default ViewDetailsDrawer;
