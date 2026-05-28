"use client";

import { useSearchParams } from "next/navigation";
import {
  SETTINGS_TABS,
  SettingsShell,
  type SettingsTabId,
} from "@/components/officer/settings/SettingsShell";
import {
  AccountSettingsPanel,
  CameraSettingsPanel,
  GpsSettingsPanel,
  HelpSettingsPanel,
  PrinterSettingsPanel,
} from "@/components/officer/settings/SettingsPanels";

function isSettingsTab(value: string | null): value is SettingsTabId {
  return SETTINGS_TABS.some((tab) => tab.id === value);
}

export default function OfficerSettingsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTabId = isSettingsTab(tabParam) ? tabParam : "printer";

  return (
    <SettingsShell activeTab={activeTab}>
      {activeTab === "printer" && <PrinterSettingsPanel />}
      {activeTab === "camera" && <CameraSettingsPanel />}
      {activeTab === "gps" && <GpsSettingsPanel />}
      {activeTab === "account" && <AccountSettingsPanel />}
      {activeTab === "help" && <HelpSettingsPanel />}
    </SettingsShell>
  );
}
