"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}

export const StatCard = ({
  icon,
  title,
  value,
  subValue,
  trend,
  trendUp,
  loading = false,
}: StatCardProps) => {
  // Loading skeleton
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[var(--color-surface-soft)] animate-pulse">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="w-12 sm:w-16 h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="mt-3 sm:mt-4 space-y-2">
          <div className="w-20 sm:w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="flex items-baseline gap-2">
            <div className="w-16 sm:w-20 h-6 sm:h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 sm:p-5 bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[var(--color-surface-soft)] flex items-center justify-center">
          {icon}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
              trendUp
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}
          >
            {trendUp ? <TrendingUp size={11} className="sm:w-3 sm:h-3" /> : <TrendingDown size={11} className="sm:w-3 sm:h-3" />}
            <span className="hidden xs:inline">{trend}</span>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <p className="text-[10px] sm:text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            {value}
          </h3>
          {subValue && (
            <span className="text-[11px] sm:text-sm font-bold text-[var(--color-text-secondary)] opacity-70">
              ({subValue})
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};