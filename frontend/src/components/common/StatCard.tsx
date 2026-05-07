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
}

export const StatCard = ({
  icon,
  title,
  value,
  subValue,
  trend,
  trendUp,
}: StatCardProps) => (
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
