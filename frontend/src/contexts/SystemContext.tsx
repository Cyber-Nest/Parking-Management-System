"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  settingsService,
  SystemSettings,
  BrandingSettings,
} from "@/services/settings.service";
import { getTokenValue } from "@/lib/axios";

interface SystemContextType {
  system: SystemSettings | null;
  branding: BrandingSettings | null;
  loading: boolean;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  updateBrandingSettings: (
    settings: Partial<BrandingSettings>,
  ) => Promise<void>;
  refreshSettings: () => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

// Helper function to apply branding to DOM
const applyBrandingToDOM = (settings: BrandingSettings) => {
  // Apply theme color
  document.documentElement.style.setProperty(
    "--color-primary",
    settings.themeColor,
  );

  // Apply dark mode
  if (settings.darkMode === "dark") {
    document.documentElement.classList.add("dark");
  } else if (settings.darkMode === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  if (settings.systemName) {
    document.title = settings.systemName;
  }

  if (settings.faviconUrl) {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }
};

const applySystemToStorage = (settings: SystemSettings) => {
  localStorage.setItem("system_settings", JSON.stringify(settings));
};

const applyBrandingToStorage = (settings: BrandingSettings) => {
  localStorage.setItem("branding_settings", JSON.stringify(settings));
};
const getFromStorage = () => {
  try {
    const system = localStorage.getItem("system_settings");
    const branding = localStorage.getItem("branding_settings");
    return {
      system: system ? JSON.parse(system) : null,
      branding: branding ? JSON.parse(branding) : null,
    };
  } catch {
    return { system: null, branding: null };
  }
};

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [system, setSystem] = useState<SystemSettings | null>(null);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      const stored = getFromStorage();
      if (stored.system) setSystem(stored.system);
      if (stored.branding) setBranding(stored.branding);

      const token = getTokenValue("token");
      const isAdminArea = window.location.pathname.startsWith("/admin");
      if (!token || !isAdminArea) {
        // Fetch settings only for authenticated admin/admin area users.
        setLoading(false);
        return;
      }

      // Then fetch from API
      const [systemRes, brandingRes] = await Promise.all([
        settingsService.getSystemSettings(),
        settingsService.getBrandingSettings(),
      ]);

      setSystem(systemRes);
      setBranding(brandingRes);

      // Apply branding to DOM
      applyBrandingToDOM(brandingRes);

      // Save to localStorage
      applySystemToStorage(systemRes);
      applyBrandingToStorage(brandingRes);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update system settings
  const updateSystemSettings = useCallback(
    async (newSettings: Partial<SystemSettings>) => {
      try {
        const updatedSettings = { ...system, ...newSettings } as SystemSettings;
        setSystem(updatedSettings);
        applySystemToStorage(updatedSettings);

        await settingsService.updateSystemSettings(updatedSettings);
      } catch (error) {
        console.error("Failed to update system settings:", error);
        throw error;
      }
    },
    [system],
  );

  // Update branding settings
  const updateBrandingSettings = useCallback(
    async (newSettings: Partial<BrandingSettings>) => {
      try {
        const updatedSettings = {
          ...branding,
          ...newSettings,
        } as BrandingSettings;
        setBranding(updatedSettings);
        applyBrandingToDOM(updatedSettings);
        applyBrandingToStorage(updatedSettings);

        await settingsService.updateBrandingSettings(updatedSettings);
      } catch (error) {
        console.error("Failed to update branding settings:", error);
        throw error;
      }
    },
    [branding],
  );

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const resetToDefault = useCallback(async () => {
    try {
      const [systemRes, brandingRes] = await Promise.all([
        settingsService.getSystemSettings(),
        settingsService.getBrandingSettings(),
      ]);

      setSystem(systemRes);
      setBranding(brandingRes);
      applyBrandingToDOM(brandingRes);
      applySystemToStorage(systemRes);
      applyBrandingToStorage(brandingRes);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error;
    }
  }, []);

  // Listen for system preference changes (dark mode)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (branding?.darkMode === "system") {
        if (mediaQuery.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [branding?.darkMode]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SystemContext.Provider
      value={{
        system,
        branding,
        loading,
        updateSystemSettings,
        updateBrandingSettings,
        refreshSettings,
        resetToDefault,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

// Custom hook to use system context
export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystem must be used within SystemProvider");
  }
  return context;
};
