"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  Bluetooth,
  CheckCircle2,
  ChevronRight,
  Info,
  LogOut,
  MapPin,
  Printer,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import {
  fetchOfflineQueue,
  getPendingByType,
  loadSyncSettings,
  saveSyncSettings,
  type SyncSettings,
} from "@/lib/officer-offline";
import { officerPortalService, type OfficerProfile } from "@/services/officer-portal.service";
import {
  SegmentedControl,
  SettingsCard,
  SettingsLinkRow,
  Toggle,
} from "./SettingsShell";

const SAMPLE_CAR =
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80";

export function PrinterSettingsPanel() {
  const [selectedPrinter, setSelectedPrinter] = useState("bixolon");
  const [paperSize, setPaperSize] = useState("80mm");
  const [density, setDensity] = useState("Normal");
  const [autoCut, setAutoCut] = useState(true);
  const [printBeep, setPrintBeep] = useState(true);
  const [printBarcode, setPrintBarcode] = useState(true);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const connected = selectedPrinter === "bixolon";

  useEffect(() => {
    setCurrentDate(new Date().toLocaleString());
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SettingsCard title="Paired Printers">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
            <input type="radio" checked={selectedPrinter === "bixolon"} onChange={() => setSelectedPrinter("bixolon")} />
            <Printer size={20} className="text-slate-500" />
            <div className="flex-1">
              <p className="font-semibold">Bixolon SPP-R310</p>
              <p className="text-xs text-slate-500">00:11:62:AA:BB:CC</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Connected</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 opacity-70">
            <input type="radio" checked={selectedPrinter === "zebra"} onChange={() => setSelectedPrinter("zebra")} />
            <Printer size={20} className="text-slate-400" />
            <div className="flex-1">
              <p className="font-semibold">Zebra ZQ320</p>
              <p className="text-xs text-slate-500">00:14:88:CC:DD:EE</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">Not Connected</span>
          </label>
        </div>
        <button type="button" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-3 text-sm font-bold text-slate-700">
          <Bluetooth size={16} />
          Search for Printers
        </button>
      </SettingsCard>

      <SettingsCard title="Connection Status">
        {connected ? (
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <p className="mt-2 text-lg font-bold text-emerald-700">Connected</p>
            <p className="text-sm text-slate-500">Bixolon SPP-R310</p>
            <dl className="mt-6 space-y-2 text-left text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Battery</dt><dd className="font-semibold text-emerald-600">85%</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Signal</dt><dd className="font-semibold text-emerald-600">Strong</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Paper</dt><dd className="font-semibold text-emerald-600">OK</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="font-semibold">Bluetooth</dd></div>
            </dl>
            <button type="button" className="mt-6 w-full rounded-lg border border-rose-200 py-2.5 text-sm font-bold text-rose-600">
              Disconnect
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a paired printer to view connection status.</p>
        )}
      </SettingsCard>

      <SettingsCard title="Printer Preferences">
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Paper Size</span>
            <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5">
              <option value="80mm">80mm</option>
              <option value="58mm">58mm</option>
            </select>
          </label>
          <div>
            <span className="text-sm font-semibold text-slate-700">Print Density</span>
            <div className="mt-2">
              <SegmentedControl value={density} options={["Light", "Normal", "Dark"]} onChange={setDensity} />
            </div>
          </div>
          <Toggle checked={autoCut} onChange={setAutoCut} label="Auto Cut" />
          <Toggle checked={printBeep} onChange={setPrintBeep} label="Print Beep" />
          <Toggle checked={printBarcode} onChange={setPrintBarcode} label="Print Ticket Number Barcode" />
        </div>
      </SettingsCard>

      <SettingsCard title="Test Print">
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center font-mono text-xs">
          <p className="font-bold">*** TEST PRINT ***</p>
          <p className="mt-2">PARKs-SMART ENFORCEMENT</p>
          <p>Bixolon SPP-R310 • {paperSize}</p>
          <p className="mt-2">{currentDate}</p>
          <p className="text-emerald-600">Status: Ready</p>
        </div>
        <button
          type="button"
          onClick={() => toast.success("Test print sent to printer")}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1062ff] py-3 text-sm font-bold text-white"
        >
          <Printer size={16} />
          Print Test Ticket
        </button>
      </SettingsCard>

      <div className="xl:col-span-2 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <Info size={18} className="shrink-0" />
          Having trouble? Make sure the printer is on, has paper, and is within Bluetooth range.
        </p>
        <button type="button" className="inline-flex items-center gap-1 font-semibold text-[#1062ff]">
          View Troubleshooting Guide <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function CameraSettingsPanel() {
  const [photoQuality, setPhotoQuality] = useState("Standard");
  const [imageFormat, setImageFormat] = useState("JPEG");
  const [videoQuality, setVideoQuality] = useState("Standard");
  const [videoDuration, setVideoDuration] = useState("2 Minutes");
  const [autoTimestamp, setAutoTimestamp] = useState(true);
  const [autoGps, setAutoGps] = useState(true);
  const [gridOverlay, setGridOverlay] = useState(false);
  const [saveOriginal, setSaveOriginal] = useState(true);
  const [videoTimestamp, setVideoTimestamp] = useState(true);
  const [cameraAllowed, setCameraAllowed] = useState(true);

  const checkCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCameraAllowed(true);
      toast.success("Camera permission is allowed");
    } catch {
      setCameraAllowed(false);
      toast.error("Camera permission denied");
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className={`rounded-xl border p-4 ${cameraAllowed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <p className={`text-sm font-bold ${cameraAllowed ? "text-emerald-800" : "text-rose-800"}`}>
            Camera Permission: {cameraAllowed ? "Allowed" : "Denied"}
          </p>
          <p className="mt-1 text-xs text-slate-600">App can {cameraAllowed ? "" : "not "}access camera.</p>
          <button type="button" onClick={() => void checkCamera()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
            <RefreshCw size={14} />
            Check Again
          </button>
        </div>

        <SettingsCard title="Photo Settings">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold">Photo Quality</span>
              <div className="mt-2">
                <SegmentedControl value={photoQuality} options={["Standard"]} onChange={setPhotoQuality} />
              </div>
            </div>
            <label className="block text-sm">
              <span className="font-semibold">Image Format</span>
              <select value={imageFormat} onChange={(e) => setImageFormat(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5">
                <option>JPEG</option>
                <option>PNG</option>
              </select>
            </label>
            <Toggle checked={autoTimestamp} onChange={setAutoTimestamp} label="Auto Timestamp" />
            <Toggle checked={autoGps} onChange={setAutoGps} label="Auto GPS Tag" />
            <Toggle checked={gridOverlay} onChange={setGridOverlay} label="Grid Overlay" />
            <Toggle checked={saveOriginal} onChange={setSaveOriginal} label="Save Original Photo" />
          </div>
        </SettingsCard>

        <SettingsCard title="Video Settings">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold">Video Quality</span>
              <div className="mt-2">
                <SegmentedControl value={videoQuality} options={["Standard"]} onChange={setVideoQuality} />
              </div>
            </div>
            <label className="block text-sm">
              <span className="font-semibold">Video Duration Limit</span>
              <select value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5">
                <option>1 Minute</option>
                <option>2 Minutes</option>
                <option>5 Minutes</option>
              </select>
            </label>
            <Toggle checked={videoTimestamp} onChange={setVideoTimestamp} label="Auto Timestamp" />
          </div>
        </SettingsCard>
      </div>

      <aside className="space-y-4">
        <SettingsCard title="Preview">
          <p className="mb-3 text-xs text-slate-500">How evidence photos will look with current settings.</p>
          <div className="relative overflow-hidden rounded-lg">
            <img src={SAMPLE_CAR} alt="Preview" className="h-40 w-full object-cover" />
            {autoTimestamp || autoGps ? (
              <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-[10px] text-white">
                {autoTimestamp ? <p>May 20, 2025 10:30 AM</p> : null}
                {autoGps ? <p>43.5532° N, 79.3832° W</p> : null}
              </div>
            ) : null}
          </div>
        </SettingsCard>
        <SettingsCard title="Quick Actions">
          <div className="space-y-2 text-sm">
            <button type="button" className="w-full rounded-lg border py-2.5 font-semibold text-[#1062ff]">Open Camera</button>
            <button type="button" className="w-full rounded-lg border py-2.5 font-semibold text-[#1062ff]">Record Video</button>
            <Link href="/officer/evidence" className="block w-full rounded-lg border py-2.5 text-center font-semibold text-[#1062ff]">
              View Sample Evidence
            </Link>
          </div>
        </SettingsCard>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
          Evidence photos and videos are securely stored and linked to tickets automatically.
        </div>
      </aside>
    </div>
  );
}

export function SyncSettingsPanel() {
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [counts, setCounts] = useState({ tickets: 0, evidence: 0, payments: 0, other: 0, total: 0 });

  useEffect(() => {
    void (async () => {
      const [syncSettings, queue] = await Promise.all([loadSyncSettings(), fetchOfflineQueue()]);
      setSettings(syncSettings);
      setCounts(getPendingByType(queue));
    })();
  }, []);

  const update = (patch: Partial<SyncSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    void saveSyncSettings(next);
  };

  const lastSync = settings?.lastSyncAt
    ? new Date(settings.lastSyncAt).toLocaleString()
    : "Never";
  const nextSync = settings?.lastSyncAt
    ? new Date(new Date(settings.lastSyncAt).getTime() + (settings.syncIntervalMinutes || 15) * 60000).toLocaleString()
    : "—";

  const allSynced = counts.total === 0;

  return (
    <div className="space-y-4">
      <SettingsCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${allSynced ? "bg-emerald-100" : "bg-amber-100"}`}>
              <CheckCircle2 className={allSynced ? "text-emerald-600" : "text-amber-600"} size={28} />
            </div>
            <div>
              <p className="text-lg font-bold">{allSynced ? "All synced" : `${counts.total} pending`}</p>
              <p className="text-sm text-slate-500">{allSynced ? "Your data is up to date." : "Some records are waiting to upload."}</p>
              <p className="mt-1 text-xs text-slate-500">Last Sync: {lastSync}</p>
              <p className="text-xs text-slate-500">Next Auto Sync: {nextSync}</p>
            </div>
          </div>
          <Link
            href="/officer/offline-records"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1062ff] px-5 py-3 text-sm font-bold text-white"
          >
            <RefreshCw size={16} />
            Sync Now
          </Link>
        </div>
      </SettingsCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard title="Offline Summary">
          <dl className="space-y-3 text-sm">
            <SummaryRow label="Tickets" value={`${counts.tickets} Pending`} />
            <SummaryRow label="Evidence (Photos)" value={`${counts.evidence} Pending`} />
            <SummaryRow label="Payments" value={`${counts.payments} Pending`} />
            <SummaryRow label="Other Records" value={`${counts.other} Pending`} />
          </dl>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <strong>Total Pending Records: {counts.total}</strong>
            <p className="text-xs">Will sync automatically when online.</p>
          </div>
          <SettingsLinkRow href="/officer/offline-records" label="View Offline Records →" />
        </SettingsCard>

        <SettingsCard title="Sync Settings">
          {settings ? (
            <div className="space-y-1">
              <Toggle checked={settings.autoSync} onChange={(v) => update({ autoSync: v })} label="Auto Sync" description="Automatically sync when internet is available" />
              <Toggle checked={settings.wifiOnly} onChange={(v) => update({ wifiOnly: v })} label="Sync on Wi-Fi Only" description="Sync only when connected to Wi-Fi" />
              <Toggle checked={settings.backgroundSync} onChange={(v) => update({ backgroundSync: v })} label="Background Sync" description="Sync while using the app" />
              <label className="mt-4 block text-sm">
                <span className="font-semibold">Sync Interval</span>
                <select
                  value={String(settings.syncIntervalMinutes)}
                  onChange={(e) => update({ syncIntervalMinutes: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border px-3 py-2.5"
                >
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </label>
            </div>
          ) : null}
        </SettingsCard>
      </div>

      <SettingsCard title="Offline Mode">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <WifiOff size={28} className="text-slate-500" />
          </div>
          <div className="text-sm text-slate-600">
            <p>The app works offline. Tickets, evidence, and payments are saved locally and uploaded when connection returns.</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-xs">
              <li>Sync before ending your shift</li>
              <li>Keep the app open for background sync</li>
              <li>Do not clear app data while records are pending</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <ShieldCheck size={18} />
          Your data is safe while offline.
        </div>
      </SettingsCard>
    </div>
  );
}

export function GpsSettingsPanel() {
  return (
    <div className="space-y-4">
      <SettingsCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="text-emerald-600" size={32} />
            <div>
              <p className="font-bold text-emerald-700">GPS is Enabled</p>
              <p className="text-sm text-slate-500">Device location is active and working.</p>
              <p className="text-xs font-semibold text-emerald-600">Accuracy: High (8 m)</p>
            </div>
          </div>
          <button type="button" onClick={() => toast.success("Location refreshed")} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold">
            <RefreshCw size={16} />
            Refresh Location
          </button>
        </div>
      </SettingsCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard title="Current Location">
          <p className="text-sm font-semibold">123 Queen St W, Toronto, ON M5H 2N2, Canada</p>
          <p className="mt-1 text-xs text-slate-500">Lat: 43.6532 • Lng: -79.3832</p>
          <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live • Just now
          </span>
        </SettingsCard>

        <SettingsCard title="Assigned Enforcement Zone">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
              Zone map preview
            </div>
            <div className="text-sm">
              <p className="font-bold">Zone A — Downtown</p>
              <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">Active</span>
              <p className="mt-2 text-slate-500">Zone Area: 1.25 km²</p>
              <p className="text-slate-500">Patrol: 08:00 AM – 04:00 PM</p>
              <p className="text-slate-500">Effective: May 20, 2025</p>
            </div>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard title="Location Permissions">
        <PermissionRow label="Location Permission" status="Granted" />
        <PermissionRow label="Background Location" status="Allowed" />
      </SettingsCard>

      <SettingsCard title="Location Options">
        <label className="block text-sm">
          <span className="font-semibold">GPS Mode</span>
          <select className="mt-1 w-full rounded-lg border px-3 py-2.5">
            <option>High Accuracy</option>
            <option>Balanced</option>
            <option>Battery Saver</option>
          </select>
          <span className="text-xs text-slate-500">Recommended for enforcement</span>
        </label>
        <label className="mt-4 block text-sm">
          <span className="font-semibold">Update Frequency</span>
          <select className="mt-1 w-full rounded-lg border px-3 py-2.5">
            <option>Every 5 Seconds</option>
            <option>Every 15 Seconds</option>
            <option>Every 30 Seconds</option>
          </select>
        </label>
      </SettingsCard>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <Info size={16} className="mr-2 inline" />
        For best accuracy, keep GPS enabled and avoid battery saver mode.
      </div>
    </div>
  );
}

export function AccountSettingsPanel() {
  const [autoLock, setAutoLock] = useState(true);
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void officerPortalService.getProfile()
      .then((p) => {
        setProfile(p);
        setPhone(p.phone ?? "");
        setZone(p.assignedZone ?? "");
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Could not load profile"));
      });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await officerPortalService.updateProfile({ phone, assignedZone: zone });
      setProfile(updated);
      window.localStorage.setItem("officerProfile", JSON.stringify(updated));
      toast.success("Profile saved");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("officer_token");
    localStorage.removeItem("officer_refreshToken");
    localStorage.removeItem("officerProfile");
    window.location.href = "/officer/login";
  };

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <SettingsCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold">Officer Information</h3>
          <button type="button" onClick={() => void saveProfile()} disabled={saving} className="text-sm font-bold text-[#1062ff] disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Full Name" value={profile?.fullName ?? "—"} />
          <Field label="Officer ID" value={profile?.badgeNumber ?? profile?.id?.slice(0, 8) ?? "—"} />
          <Field label="Email" value={profile?.email ?? "—"} />
          <label className="block sm:col-span-1">
            <span className="text-xs font-bold text-slate-500">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-xs font-bold text-slate-500">Assigned Zone</span>
            <input value={zone} onChange={(e) => setZone(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <Field label="Role" value={profile?.role ?? "—"} />
        </dl>
      </SettingsCard>

      <SettingsCard title="Security">
        <p className="mb-3 text-xs text-slate-500">Manage your password and login security.</p>
        <button type="button" className="mb-2 w-full rounded-lg border py-3 text-sm font-bold">Change PIN</button>
        <Link href="/officer/forgot-password" className="mb-2 block w-full rounded-lg border py-3 text-center text-sm font-bold">
          Change Password
        </Link>
        <Toggle checked={autoLock} onChange={setAutoLock} label="Auto Lock" description="Lock app after 5 minutes of inactivity" />
      </SettingsCard>

      <SettingsCard title="Preferences">
        <label className="block text-sm">
          <span className="font-semibold">Language</span>
          <select className="mt-1 w-full rounded-lg border px-3 py-2.5"><option>English</option></select>
        </label>
        <label className="mt-3 block text-sm">
          <span className="font-semibold">Date & Time Format</span>
          <select className="mt-1 w-full rounded-lg border px-3 py-2.5"><option>May 20, 2025 10:30 AM</option></select>
        </label>
        <label className="mt-3 block text-sm">
          <span className="font-semibold">Time Zone</span>
          <select className="mt-1 w-full rounded-lg border px-3 py-2.5"><option>(UTC-04:00) Toronto</option></select>
        </label>
      </SettingsCard>

      <SettingsCard title="About">
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <Field label="App Version" value="v2.4.0 (Build 125)" />
          <Field label="Device" value="Galaxy Tab Active5" />
          <Field label="Device ID" value="A5F4-K9D2-93L1" />
        </dl>
      </SettingsCard>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-300 py-4 text-sm font-bold text-rose-600"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}

export function HelpSettingsPanel() {
  return (
    <SettingsCard title="Help & Support">
      <p className="text-sm font-semibold text-slate-700">Support: +1 (555) 010-2040</p>
    </SettingsCard>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function PermissionRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm">{label}</span>
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{status}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
