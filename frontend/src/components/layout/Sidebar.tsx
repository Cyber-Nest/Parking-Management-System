"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MapPinned,
  CreditCard,
  Ticket,
  UserCog,
  Map,
  FileBarChart,
  Settings,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react";

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login";
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/active-parking", icon: MapPinned, label: "Active Parking" },
    { href: "/payments", icon: CreditCard, label: "Payments" },
    { href: "/penalty-tickets", icon: Ticket, label: "Penalty Tickets" },
    { href: "/officer-management", icon: UserCog, label: "Officer Management" },
    { href: "/parking-plan", icon: Map, label: "Parking Plan & Penalty" },
    {
      label: "Reports",
      icon: FileBarChart,
      isDropdown: true,
      subItems: [
        { label: "Revenue Reports", href: "/reports/revenue" },
        { label: "Parking Usage", href: "/reports/usage" },
        { label: "Penalty Reports", href: "/reports/penalty" },
        { label: "Officer Performance", href: "/reports/performance" },
        { label: "Payment Reconciliation", href: "/reports/payment-reconciliation" },
        { label: "Outstanding / Due", href: "/reports/due" },
        { label: "Location Performance", href: "/reports/location" },
        { label: "Peak Hours & Occupancy", href: "/reports/occupancy" },
        { label: "Plan Performance", href: "/reports/plan" },
        { label: "Audit Logs", href: "/reports/audit" },
        { label: "Vehicle History", href: "/reports/vehicle-history" },
        { label: "Refunds & Adjustments", href: "/reports/refunds" },
      ],
    },
    { href: "/setting", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed md:static z-50 top-0 left-0 h-screen w-72 
          bg-[var(--color-primary)] text-white/90
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
          flex flex-col border-r border-white/5
        `}
      >
        {/* Logo Section */}
        <div className="h-20 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <span className="font-black text-lg md:text-xl text-white">P</span>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-white">
              ParkSmart
            </span>
          </div>
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 md:px-5 py-2 space-y-1 md:space-y-2 scrollbar-hide">
          {navItems.map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => setIsReportsOpen(!isReportsOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 md:py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="md:w-5 md:h-5" />
                      <span className="font-medium text-[13px] md:text-[14px]">{item.label}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isReportsOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isReportsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="relative ml-6 border-l border-white/10 overflow-hidden flex flex-col"
                      >
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                              className={`py-2 pl-6 pr-4 text-[12px] md:text-[13px] transition-all hover:text-white ${
                                isSubActive ? "text-white font-bold" : "text-white/50"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href || '#'}
                onClick={() => setIsOpen(false)}
                className="relative block"
              >
                <div
                  className={`
                    flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 group
                    ${isActive ? "text-[var(--color-primary)]" : "text-white/60 hover:text-white hover:bg-white/5"}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white rounded-xl shadow-lg"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}

                  <item.icon
                    size={18}
                    className={`relative z-10 md:w-5 md:h-5 ${isActive ? "text-[var(--color-primary)]" : "group-hover:scale-110 transition-transform"}`}
                  />
                  <span className="relative z-10 font-medium text-[13px] md:text-[14px]">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 md:py-3 text-white/50 hover:text-white bg-white/5 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-xs md:text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}