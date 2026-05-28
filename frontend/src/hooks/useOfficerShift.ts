"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  formatDutyDuration,
  officerPortalService,
  type OfficerShiftState,
} from "@/services/officer-portal.service";

const SHIFT_CACHE_KEY = "officerShiftState";

function readCachedShift(): OfficerShiftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHIFT_CACHE_KEY);
    return raw ? (JSON.parse(raw) as OfficerShiftState) : null;
  } catch {
    return null;
  }
}

function cacheShift(data: OfficerShiftState | null) {
  if (typeof window === "undefined") return;
  if (!data) {
    window.localStorage.removeItem(SHIFT_CACHE_KEY);
    return;
  }
  window.localStorage.setItem(SHIFT_CACHE_KEY, JSON.stringify(data));
}

function secondsFromShift(data: OfficerShiftState): number {
  if (!data.onDuty || !data.shift?.startedAt) return data.onDutySecondsToday;
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(data.shift.startedAt).getTime()) / 1000),
  );
  return Math.max(data.onDutySecondsToday, elapsed);
}

export function useOfficerShift() {
  const [shiftState, setShiftState] = useState<OfficerShiftState | null>(() => readCachedShift());
  const [liveSeconds, setLiveSeconds] = useState(() => {
    const cached = readCachedShift();
    return cached ? secondsFromShift(cached) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await officerPortalService.getShift();
      setShiftState(data);
      setLiveSeconds(secondsFromShift(data));
      cacheShift(data);
    } catch (error) {
      console.error(error);
      const cached = readCachedShift();
      if (cached) {
        setShiftState(cached);
        setLiveSeconds(secondsFromShift(cached));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const poll = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(poll);
  }, [refresh]);

  useEffect(() => {
    if (!shiftState?.onDuty) return;
    const tick = window.setInterval(() => {
      setLiveSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(tick);
  }, [shiftState?.onDuty]);

  const startShift = async () => {
    try {
      const data = await officerPortalService.startShift();
      setShiftState(data);
      setLiveSeconds(secondsFromShift(data));
      cacheShift(data);
      toast.success("Shift started");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start shift"));
    }
  };

  const endShift = async () => {
    setEnding(true);
    try {
      const data = await officerPortalService.endShift();
      setShiftState(data);
      setLiveSeconds(data.onDutySecondsToday);
      cacheShift(data);
      toast.success("Shift ended");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not end shift"));
    } finally {
      setEnding(false);
    }
  };

  const startedAtLabel = shiftState?.shift?.startedAt
    ? new Date(shiftState.shift.startedAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return {
    shiftState,
    loading,
    ending,
    onDuty: shiftState?.onDuty ?? false,
    liveSeconds,
    liveLabel: formatDutyDuration(liveSeconds),
    startedAtLabel,
    pendingOffline: shiftState?.pendingOfflineCount ?? 0,
    refresh,
    startShift,
    endShift,
  };
}
