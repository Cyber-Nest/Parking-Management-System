import { OfficerShell } from "@/components/officer/OfficerShell";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return <OfficerShell>{children}</OfficerShell>;
}
