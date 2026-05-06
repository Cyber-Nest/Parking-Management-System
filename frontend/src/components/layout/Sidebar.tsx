"use client";

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
} from "lucide-react";

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();

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
    { href: "/reports", icon: FileBarChart, label: "Reports" },
    { href: "/setting", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
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
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <span className="font-black text-xl text-white">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              ParkSmart
            </span>
          </div>
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-5 py-2 space-y-2 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="relative block"
              >
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                    ${
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {/* Shared Layout Animation for Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)]"
                      transition={{
                        type: "spring",
                        bounce: 0.25,
                        duration: 0.5,
                      }}
                    />
                  )}

                  <item.icon
                    size={20}
                    className={`relative z-10 ${
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span className="relative z-10 font-medium text-[14px]">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/50 hover:text-white bg-white/5 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
