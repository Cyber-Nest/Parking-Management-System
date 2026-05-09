"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

interface DashboardStatCardProps {
  stat: {
    id: number;
    label: string;
    value: string | number;
    icon: string;
    color: string;
    bg: string;
  };
  index: number;
  loading?: boolean;
}

export const DashboardStatCard = ({ stat, index, loading = false }: DashboardStatCardProps) => {
  const [IconComponent, setIconComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the icon
    const loadIcon = async () => {
      const iconName = stat.icon as keyof typeof Icons;
      const Icon = Icons[iconName];
      setIconComponent(() => Icon);
    };
    loadIcon();
  }, [stat.icon]);

  // Loading skeleton
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="p-4 md:p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between min-h-[140px] md:min-h-[160px]"
      >
        <div className="flex justify-between items-start">
          <div className="p-2 md:p-3 rounded-xl bg-[var(--color-surface-soft)] animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="w-16 h-6 md:h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 md:p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all flex flex-col justify-between min-h-[140px] md:min-h-[160px] group"
    >
      <div className="flex justify-between items-start">
        <div
          className="p-2 md:p-3 rounded-xl shadow-sm transition-all group-hover:scale-105"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          {IconComponent && (
            <IconComponent 
              size={20} 
              className="md:w-6 md:h-6"
              style={{ color: stat.color }}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] md:text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider truncate">
          {stat.label}
        </p>
        <h3 className="text-lg md:text-xl xl:text-2xl font-black text-[var(--color-text-primary)] mt-0.5 tracking-tight">
          {stat.value}
        </h3>
      </div>
    </motion.div>
  );
};