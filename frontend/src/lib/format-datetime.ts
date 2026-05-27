/** Stable date/time strings for SSR + print (avoid locale hydration mismatches). */

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function formatThermalTime(date: Date): string {
  const hours24 = date.getHours();
  const hour12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours24 < 12 ? "AM" : "PM";
  return `${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;
}

export function formatThermalDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  return `${MONTHS_SHORT[date.getMonth()]} ${day}, ${date.getFullYear()}`;
}
