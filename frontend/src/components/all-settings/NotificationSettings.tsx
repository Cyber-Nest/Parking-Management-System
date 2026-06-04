"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  AlertCircle,
  Save,
  RotateCcw,
  Info,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  NotificationSettings as NotificationSettingsType,
} from "@/services/settings.service";

//Toggle for Notification List
const NotificationToggle = ({
  label,
  checked,
  onChange,
  disabled = false,
}: any) => (
  <div className="flex items-center justify-between py-4 transition-all">
    <div className="flex flex-col gap-0.5">
      <span
        className={`text-[13px] font-bold ${disabled ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}`}
      >
        {label}
        {disabled && (
          <span className="text-[10px] ml-2 opacity-60 font-medium">
            (Coming Soon)
          </span>
        )}
      </span>
    </div>
    <button
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 outline-none ${
        checked ? "bg-[var(--color-primary)]" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "translate-x-5.5" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export const NotificationSettings = ({ parkingLotId }: { parkingLotId?: string }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsType>({
    paymentSuccessEmail: true,
    penaltyIssuedAlert: true,
    penaltyPaidEmail: true,
    expiredParkingAlert: true,
    smsNotifications: false,
    adminAlertEmail: true,
    adminAlertRecipient: "alerts@parksmart.com",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getNotificationSettings(parkingLotId || undefined);
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [parkingLotId]);

  const handleToggleChange = (
    field: keyof NotificationSettingsType,
    value: boolean,
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response =
        await settingsService.updateNotificationSettings(settings, parkingLotId || undefined);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="h-96 bg-gray-100 rounded-[32px] animate-pulse" />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Toggle List */}
        <div className="lg:col-span-6 bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
          <div className="space-y-1 divide-y divide-[var(--color-border)]/50">
            <NotificationToggle
              label="Email Notifications"
              checked={settings.adminAlertEmail}
              onChange={(v: boolean) =>
                handleToggleChange("adminAlertEmail", v)
              }
            />
            <NotificationToggle
              label="Payment Successful Email"
              checked={settings.paymentSuccessEmail}
              onChange={(v: boolean) =>
                handleToggleChange("paymentSuccessEmail", v)
              }
            />
            <NotificationToggle
              label="Penalty Issued Alert"
              checked={settings.penaltyIssuedAlert}
              onChange={(v: boolean) =>
                handleToggleChange("penaltyIssuedAlert", v)
              }
            />
            <NotificationToggle
              label="Penalty Paid Email"
              checked={settings.penaltyPaidEmail}
              onChange={(v: boolean) =>
                handleToggleChange("penaltyPaidEmail", v)
              }
            />
            <NotificationToggle
              label="Expired Parking Alert"
              checked={settings.expiredParkingAlert}
              onChange={(v: boolean) =>
                handleToggleChange("expiredParkingAlert", v)
              }
            />
            <NotificationToggle
              label="SMS Notifications"
              checked={false}
              onChange={() => {}}
              disabled={true}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-2">
              Admin Alert Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={16}
              />
              <input
                type="email"
                value={settings.adminAlertRecipient}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    adminAlertRecipient: e.target.value,
                  })
                }
                placeholder="alerts@parksmart.com"
                className="w-full pl-11 pr-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl text-sm font-bold focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Status Preview Card */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-[var(--color-surface-soft)] p-10 rounded-[32px] border border-[var(--color-border)]/50 flex flex-col items-start gap-6 h-full min-h-[300px]">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[var(--color-primary)]">
              <Mail size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">
                Notifications Status
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] font-medium leading-relaxed mt-2">
                Email notifications will be sent based on the settings
                configured. Our system ensures delivery within seconds of the
                event trigger.
              </p>
            </div>

            <div className="mt-auto w-full space-y-3">
              <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-surface-soft)] p-3 rounded-xl border border-[var(--color-primary)]/10">
                <CheckCircle2 size={16} />
                <span>Mail Server: Online (AWS SES)</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-surface-soft)] p-3 rounded-xl border border-[var(--color-primary)]/10">
                <AlertCircle size={16} />
                <span>SMS Gateway: Integrating...</span>
              </div>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2.5 px-10 py-3.5 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span className="text-[14px] font-bold tracking-wide">
                Save Preferences
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
