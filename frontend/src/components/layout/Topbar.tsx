"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiMoon,
} from "react-icons/fi";

export default function Topbar({
  setIsOpen,
}: {
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 h-25 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
      {/* Left Section*/}
      <div className="flex items-center gap-6">
        <button
          className="md:hidden p-2.5 hover:bg-[var(--color-bg)] rounded-xl transition-all active:scale-95"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={22} className="text-[var(--color-text-primary)]" />
        </button>

        <div className="flex flex-col">
          <motion.h1
            key={pathname}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight leading-none"
          >
            {getPageTitle()}
          </motion.h1>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium mt-1">
            <span>ParkSmart</span>
            <span>/</span>
            <span className="text-[var(--color-primary)] capitalize">
              {getPageTitle()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-5">
        {/* Notifications*/}
        <button className="relative p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] rounded-xl transition-all group">
          <FiBell
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-10 w-[1px] bg-[var(--color-border)] mx-1 hidden sm:block" />

        {/*Profile Card */}
        <button className="flex items-center gap-3.5 p-1.5 pl-2 hover:bg-[var(--color-bg)] rounded-2xl transition-all group border border-transparent hover:border-[var(--color-border)]">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-teal-900/20">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--color-success)] border-2 border-white rounded-full"></div>
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-[14px] font-bold text-[var(--color-text-primary)] leading-tight">
              John Doe
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">
              Parking Owner
            </span>
          </div>

          {/* <FiChevronDown className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-y-0.5 transition-all mr-1" /> */}
        </button>
      </div>
    </header>
  );
}
