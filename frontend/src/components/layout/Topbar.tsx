"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import { useSystem } from "@/contexts/SystemContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Topbar({
  setIsOpen,
}: {
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { branding, updateBrandingSettings } = useSystem();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  const toggleDarkMode = () => {
    if (!branding) return;
    const currentMode = branding.darkMode || "light";
    const newMode = currentMode === "dark" ? "light" : "dark";
    updateBrandingSettings({ darkMode: newMode });
  };

  // Get current theme icon
  const getThemeIcon = () => {
    const mode = branding?.darkMode || "light";
    if (mode === "dark") return <FiSun size={20} />;
    if (mode === "light") return <FiMoon size={20} />;
    return <FiMoon size={20} />;
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 sm:h-20 md:h-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 w-9 h-9 animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="hidden sm:block h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 h-20 sm:h-24 md:h-30 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          className="md:hidden p-2 hover:bg-[var(--color-bg)] rounded-xl transition-all active:scale-95"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={20} className="text-[var(--color-text-primary)]" />
        </button>

        <div className="flex flex-col">
          <motion.h1
            key={pathname}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight leading-none"
          >
            {getPageTitle()}
          </motion.h1>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[var(--color-text-muted)] font-medium mt-1">
            <span>Parks-Smart</span>
            <span>/</span>
            <span className="text-[var(--color-primary)] capitalize">
              {getPageTitle()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-5">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] rounded-xl transition-all group"
          title={branding?.darkMode === "dark" ? "Light Mode" : "Dark Mode"}
        >
          <div className="group-hover:rotate-12 transition-transform">
            {getThemeIcon()}
          </div>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] rounded-xl transition-all group">
          <FiBell
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-surface)] animate-pulse"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 sm:h-8 md:h-10 w-[1px] bg-[var(--color-border)] mx-0.5 sm:mx-1 hidden sm:block" />

        {/* Profile Card */}
        <button
          onClick={() => router.push("/setting?tab=owner-profile")}
          className="flex items-center gap-2 sm:gap-3 p-1 pl-1.5 sm:pl-2 hover:bg-[var(--color-bg)] rounded-2xl transition-all group border border-transparent hover:border-[var(--color-border)]"
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-[var(--color-primary)]/20">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--color-success)] border-2 border-[var(--color-surface)] rounded-full"></div>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[12px] sm:text-[14px] font-bold text-[var(--color-text-primary)] leading-tight">
              John Doe
            </span>
            <span className="text-[8px] sm:text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">
              Parking Owner
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
