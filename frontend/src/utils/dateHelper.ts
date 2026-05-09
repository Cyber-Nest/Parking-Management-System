import { SystemSettings } from "@/services/settings.service";

export const formatDate = (
  date: Date | string,
  settings: SystemSettings | null,
): string => {
  const d = new Date(date);
  const format = settings?.dateFormat || "DD/MM/YYYY";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const formatTime = (
  date: Date | string,
  settings: SystemSettings | null,
): string => {
  const d = new Date(date);
  const format = settings?.timeFormat || "12h";
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");

  if (format === "12h") {
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

export const formatDateTime = (
  date: Date | string,
  settings: SystemSettings | null,
): string => {
  return `${formatDate(date, settings)} ${formatTime(date, settings)}`;
};

export const formatRemainingTime = (
  minutes: number,
  settings: SystemSettings | null,
): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}H ${mins}M`;
  }
  return `${mins}M`;
};
