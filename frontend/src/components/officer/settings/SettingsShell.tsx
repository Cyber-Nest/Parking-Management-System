"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  CircleHelp,
  MapPin,
  Printer,
  User,
} from "lucide-react";

export const SETTINGS_TABS = [
  { id: "printer", label: "Printer", description: "Configure and test printer", icon: Printer },
  { id: "camera", label: "Camera & Evidence", description: "Photo and video settings", icon: Camera },
  // Sync & Offline section hidden per current officer portal requirements.
  // { id: "sync", label: "Sync & Offline", description: "Data sync settings", icon: RefreshCw },
  { id: "gps", label: "GPS / Location", description: "Location preferences", icon: MapPin },
  { id: "account", label: "Account", description: "Profile and security", icon: User },
  { id: "help", label: "Help", description: "Support and information", icon: CircleHelp },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

export function SettingsShell({
  activeTab,
  children,
}: {
  activeTab: SettingsTabId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTab = (tab: SettingsTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/officer/settings?${params.toString()}`, { scroll: false });
  };

  const current = SETTINGS_TABS.find((t) => t.id === activeTab) ?? SETTINGS_TABS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Manage device and app preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-3">
          {SETTINGS_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition ${
                  active ? "bg-[#1062ff]/10 text-[#1062ff]" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon size={18} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{tab.label}</span>
                  <span className="block text-xs text-slate-500">{tab.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">{current.label}</h2>
            <p className="text-sm text-slate-500">{current.description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SettingsCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
      {title ? <h3 className="mb-4 text-sm font-bold text-slate-900">{title}</h3> : null}
      {children}
    </section>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {description ? <span className="block text-xs text-slate-500">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#1062ff]" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            value === option ? "bg-[#1062ff] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function SettingsLinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm font-semibold text-[#1062ff] hover:underline">
      {label}
    </Link>
  );
}
