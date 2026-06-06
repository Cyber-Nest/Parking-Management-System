"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OfficerDutyWidget } from "@/components/officer/OfficerDutyWidget";
import {
  officerPortalService,
  type OfficerProfile,
} from "@/services/officer-portal.service";
import {
  Bell,
  Camera,
  ChevronDown,
  ClipboardList,
  FileText,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  Ticket,
} from "lucide-react";

const ticketSubItems = [
  { tab: "my", label: "My Tickets" },
  { tab: "all", label: "All Tickets" },
  { tab: "unpaid", label: "Unpaid Tickets" },
  { tab: "disputed", label: "Disputed Tickets" },
  { tab: "cancelled", label: "Cancelled Tickets" },
] as const;

const navItems = [
  { href: "/officer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/officer/scan", label: "Plate Lookup", icon: Search },
  { href: "/officer/issue-ticket", label: "Issue Ticket", icon: Ticket },
  { href: "/officer/sessions", label: "Active Sessions", icon: ClipboardList },
  { href: "/officer/violations", label: "Violations", icon: FileText },
  { href: "/officer/evidence", label: "Evidence", icon: Images },
  // Offline Records section hidden per current officer portal requirements.
  // { href: "/officer/offline-records", label: "Offline Records", icon: RotateCw },
  { href: "/officer/settings", label: "Settings", icon: Settings },
];

export function OfficerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const onTicketsRoute = pathname.startsWith("/officer/tickets");
  const activeTicketTab = searchParams.get("tab") ?? "my";
  const [ticketsExpanded, setTicketsExpanded] = useState(onTicketsRoute);
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const authRoutes = [
    "/officer/login",
    "/officer/forgot-password",
    "/officer/reset-password",
  ];
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  useEffect(() => {
    if (onTicketsRoute) setTicketsExpanded(true);
  }, [onTicketsRoute]);

  useEffect(() => {
    if (isAuthRoute) return;
    const cached = window.localStorage.getItem("officerProfile");
    if (cached) {
      try {
        setProfile(JSON.parse(cached) as OfficerProfile);
      } catch {
        /* ignore */
      }
    }
    void officerPortalService
      .getProfile()
      .then((p) => {
        setProfile(p);
        window.localStorage.setItem("officerProfile", JSON.stringify(p));
      })
      .catch(() => {
        /* axios interceptor handles auth redirects; keep cached profile if available */
      });
  }, [isAuthRoute]);

  const handleLogout = () => {
    localStorage.removeItem("officer_token");
    localStorage.removeItem("officer_refreshToken");
    document.cookie = "officer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "officer_refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/officer/login");
  };

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] text-[#12213f]">
        <main className="min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#12213f]">
      <div className="flex min-h-screen">
        <aside className="hidden w-52.5 shrink-0 bg-[#061b3d] text-white lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-6 py-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">Parks-Smart</p>
              <p className="text-xs text-white/70">Enforcement</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4">
            {navItems.slice(0, 5).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#1062ff] text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setTicketsExpanded((open) => !open);
                  if (!onTicketsRoute) router.push("/officer/tickets?tab=my");
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-sm font-medium transition ${
                  onTicketsRoute
                    ? "bg-[#1062ff] text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Ticket size={18} />
                  Tickets
                </span>
                <ChevronDown
                  size={16}
                  className={`transition ${ticketsExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {ticketsExpanded ? (
                <div className="ml-4 space-y-1 border-l border-white/15 pl-3">
                  {ticketSubItems.map((item) => {
                    const active =
                      onTicketsRoute && activeTicketTab === item.tab;
                    return (
                      <Link
                        key={item.tab}
                        href={`/officer/tickets?tab=${item.tab}`}
                        className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                          active
                            ? "bg-white/15 text-white"
                            : "text-white/65 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {navItems.slice(5).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#1062ff] text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <OfficerDutyWidget />

          <div className="px-6 pb-5 text-xs text-white/40">v1.2.0</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-20 items-center justify-between gap-3 px-4 md:px-7">
              <div className="flex items-center gap-2 lg:hidden">
                <Home size={20} className="text-[#1062ff]" />
                <span className="font-bold">Parks-Smart Enforcement</span>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Online</span>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
                  <Bell size={20} />
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    3
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/officer/evidence?capture=true")}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <Camera size={16} />
                  Take Photo
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80')] bg-cover bg-center" />
                  <div>
                    <p className="text-sm font-bold">
                      {profile?.fullName ?? "Officer"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {profile?.parkingLotName || profile?.assignedZone
                        ? `${profile?.parkingLotName || profile?.assignedZone} • ID: ${profile?.badgeNumber ?? profile?.id?.slice(0, 8) ?? "—"}`
                        : `ID: ${profile?.badgeNumber ?? profile?.id?.slice(0, 8) ?? "—"}`}
                    </p>
                    <p className="text-xs text-slate-400">{profile?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 px-4 py-3 md:px-7 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-700">
                  Quick Actions
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  On Duty
                </span>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex min-w-max items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-[#1062ff] bg-[#eff6ff] text-[#0f172a]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#1062ff] hover:text-[#0f172a]"
                      }`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <OfficerDutyWidget compact />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
