"use client";

import React, { useEffect, useState } from "react";
import {
  Plug,
  CreditCard,
  Wallet,
  ShoppingBag,
  Camera,
  MessageSquare,
  Save,
  RotateCcw,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  IntegrationSettings as IntegrationSettingsType,
} from "@/services/settings.service";

const StatusBadge = ({
  status,
}: {
  status: "connected" | "disconnected" | "error";
}) => {
  const config = {
    connected: {
      icon: CheckCircle2,
      label: "Live",
      className: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    disconnected: {
      icon: XCircle,
      label: "Offline",
      className: "bg-gray-50 text-gray-400 border-gray-100",
    },
    error: {
      icon: AlertCircle,
      label: "Issue",
      className: "bg-red-50 text-red-500 border-red-100",
    },
  };
  const Icon = config[status].icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config[status].className}`}
    >
      <div
        className={`w-1 h-1 rounded-full ${status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-current"}`}
      />
      {config[status].label}
    </span>
  );
};

const SecretField = ({ label, value, onChange, placeholder }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.1em] ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
};


const IntegrationWrapper = ({
  title,
  icon: Icon,
  status,
  enabled,
  onToggle,
  onTest,
  testing,
  children,
  colorClass = "text-[var(--color-primary)]",
}: any) => (
  <div
    className={`bg-[var(--color-surface)] rounded-[32px] border transition-all duration-300 ${enabled ? "border-[var(--color-border)] shadow-sm" : "border-dashed border-gray-200 opacity-75"}`}
  >
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${enabled ? `bg-current/10 ${colorClass}` : "bg-gray-100 text-gray-400"}`}
          >
            <Icon size={24} />
          </div>
          <div>
            <h4 className="font-black text-[var(--color-text-primary)] tracking-tight">
              {title}
            </h4>
            <StatusBadge status={status} />
          </div>
        </div>
        <button
          onClick={onTest}
          disabled={testing || !enabled}
          className="px-4 py-2 bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40"
        >
          {testing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            "Test Link"
          )}
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-[var(--color-surface-soft)] rounded-2xl">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Integration Status
        </span>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${enabled ? "bg-[var(--color-primary)]" : "bg-gray-300"}`}
        >
          <div
            className={`h-3.5 w-3.5 transform rounded-full bg-white transition-all ${enabled ? "translate-x-5.5" : "translate-x-1"}`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  </div>
);


export const IntegrationsSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [settings, setSettings] = useState<IntegrationSettingsType | any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getIntegrationSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        status:
          field === "enabled" && value === false
            ? "disconnected"
            : prev[key].status,
      },
    }));
  };

  const testConnection = async (type: string, config: any) => {
    setTesting(type);
    const response = await settingsService.testIntegrationConnection(
      type,
      config,
    );
    const key = type.toLowerCase();
    if (response.success) {
      toast.success(response.message);
      setSettings((prev: any) => ({
        ...prev,
        [key]: { ...prev[key], status: "connected" },
      }));
    } else {
      toast.error(response.message);
      setSettings((prev: any) => ({
        ...prev,
        [key]: { ...prev[key], status: "error" },
      }));
    }
    setTesting(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateIntegrationSettings(settings);
      toast.success("All integrations saved successfully");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-80 bg-gray-100 rounded-[32px]" />
        ))}
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Stripe */}
        <IntegrationWrapper
          title="Stripe Payments"
          icon={CreditCard}
          status={settings.stripe.status}
          enabled={settings.stripe.enabled}
          onToggle={(v: any) => handleChange("stripe", "enabled", v)}
          onTest={() =>
            testConnection("Stripe", { apiKey: settings.stripe.apiKey })
          }
          testing={testing === "Stripe"}
        >
          <SecretField
            label="API Secret Key"
            value={settings.stripe.apiKey}
            onChange={(v: any) => handleChange("stripe", "apiKey", v)}
            placeholder="sk_live_..."
          />
          <SecretField
            label="Webhook Secret"
            value={settings.stripe.webhookSecret}
            onChange={(v: any) => handleChange("stripe", "webhookSecret", v)}
            placeholder="whsec_..."
          />
        </IntegrationWrapper>

        {/* Camera */}
        <IntegrationWrapper
          title="ANPR Camera"
          icon={Camera}
          status={settings.camera.status}
          enabled={settings.camera.enabled}
          colorClass="text-indigo-600"
          onToggle={(v: any) => handleChange("camera", "enabled", v)}
          onTest={() => testConnection("Camera", settings.camera)}
          testing={testing === "Camera"}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.1em] ml-1">
                Brand
              </label>
              <select
                value={settings.camera.cameraType}
                onChange={(e) =>
                  handleChange("camera", "cameraType", e.target.value)
                }
                className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
              >
                <option value="hikvision">Hikvision</option>
                <option value="dahua">Dahua</option>
              </select>
            </div>
            <input
              placeholder="IP Address"
              value={settings.camera.ipAddress}
              onChange={(e) =>
                handleChange("camera", "ipAddress", e.target.value)
              }
              className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
            />
            <input
              placeholder="Port"
              type="number"
              value={settings.camera.port}
              onChange={(e) => handleChange("camera", "port", e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
            />
          </div>
          <SecretField
            label="Camera Password"
            value={settings.camera.password || ""}
            onChange={(v: any) => handleChange("camera", "password", v)}
            placeholder="********"
          />
        </IntegrationWrapper>

        {/* SMS Provider */}
        <IntegrationWrapper
          title="SMS Gateway"
          icon={MessageSquare}
          status={settings.sms.status}
          enabled={settings.sms.enabled}
          colorClass="text-sky-500"
          onToggle={(v: any) => handleChange("sms", "enabled", v)}
          onTest={() => testConnection("SMS", settings.sms)}
          testing={testing === "SMS"}
        >
          <select
            value={settings.sms.provider}
            onChange={(e) => handleChange("sms", "provider", e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
          >
            <option value="twilio">Twilio</option>
            <option value="vonage">Vonage</option>
          </select>
          <SecretField
            label="API Key / SID"
            value={settings.sms.apiKey}
            onChange={(v: any) => handleChange("sms", "apiKey", v)}
            placeholder="AC..."
          />
          <input
            placeholder="Sender Phone Number"
            value={settings.sms.phoneNumber}
            onChange={(e) => handleChange("sms", "phoneNumber", e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
          />
        </IntegrationWrapper>

        {/* POS System */}
        <IntegrationWrapper
          title="POS System"
          icon={ShoppingBag}
          status={settings.pos.status}
          enabled={settings.pos.enabled}
          colorClass="text-amber-500"
          onToggle={(v: any) => handleChange("pos", "enabled", v)}
          onTest={() => testConnection("POS", settings.pos)}
          testing={testing === "POS"}
        >
          <select
            value={settings.pos.integrationType}
            onChange={(e) =>
              handleChange("pos", "integrationType", e.target.value)
            }
            className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
          >
            <option value="square">Square</option>
            <option value="clover">Clover</option>
            <option value="custom">Custom API</option>
          </select>
          <input
            placeholder="API Endpoint URL"
            value={settings.pos.apiEndpoint}
            onChange={(e) => handleChange("pos", "apiEndpoint", e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-bold bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl outline-none"
          />
        </IntegrationWrapper>
      </div>

      {/* Global Save */}
      <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Info size={24} />
          </div>
          <div>
            <h5 className="text-[13px] font-bold text-[var(--color-text-primary)]">
              Sync Protection
            </h5>
            <p className="text-[11px] text-[var(--color-text-muted)] font-medium leading-relaxed mt-1">
              Changes will take effect immediately after saving. <br /> Ensure
              all "Live" status indicators are green.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <button onClick={fetchData} className="p-4 text-gray-400 hover:text-[var(--color-primary)] transition-colors"><RotateCcw size={20}/></button> */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary min-w-[220px] flex items-center justify-center gap-3 py-4 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
          >
            {saving ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            <span className="font-bold tracking-wide">
              Save All Integrations
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
