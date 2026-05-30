import { redirect } from "next/navigation";

export default async function ZoneRedirect({ params }: { params: Promise<{ zone: string }> }) {
  const resolvedParams = await params;
  if (resolvedParams.zone.toUpperCase() === "ZONE-201") {
    redirect(`/?zone=${resolvedParams.zone.toUpperCase()}`);
  } else {
    redirect(`/`);
  }
}
