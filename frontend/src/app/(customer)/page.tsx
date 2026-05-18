"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Zap,
  Globe,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { customerService, ParkingDetails } from "@/services/customer.service";

import { useParkingBooking } from "@/contexts/CustomerParkingContext";

// Skeleton Components
const NavbarSkeleton = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#C6F432]/20 rounded-lg animate-pulse"></div>
        <div className="h-6 w-24 bg-white/10 rounded-lg animate-pulse"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse"></div>
        <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse"></div>
      </div>
    </div>
  </nav>
);

const ImageSkeleton = () => (
  <div className="relative w-full h-[300px] md:h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden bg-[#1A1A1A] animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
    <div className="absolute top-6 left-6">
      <div className="bg-white/10 px-4 py-1.5 rounded-full h-8 w-24"></div>
    </div>
  </div>
);

const TitleSkeleton = () => (
  <div>
    <div className="h-16 md:h-20 lg:h-24 bg-white/10 rounded-lg animate-pulse w-3/4"></div>
    <div className="mt-2">
      <div className="h-16 md:h-20 lg:h-24 bg-white/10 rounded-lg animate-pulse w-2/3"></div>
    </div>
    <div className="mt-6 flex items-center gap-3 px-2">
      <div className="w-[18px] h-[18px] bg-white/10 rounded-full animate-pulse"></div>
      <div className="h-4 bg-white/10 rounded animate-pulse w-64"></div>
    </div>
  </div>
);

const CardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#C6F432]/10 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-3 bg-white/10 rounded animate-pulse w-24 mb-2"></div>
        <div className="h-8 bg-white/10 rounded animate-pulse w-20"></div>
      </div>
    </div>
    <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#2D7BFF]/10 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-3 bg-white/10 rounded animate-pulse w-32 mb-2"></div>
        <div className="h-8 bg-white/10 rounded animate-pulse w-24"></div>
      </div>
    </div>
  </div>
);

const CTASkeleton = () => (
  <div className="pt-4 lg:pt-8">
    <div className="w-full lg:w-max lg:px-12 bg-white/10 rounded-full h-14 animate-pulse"></div>
    <div className="h-3 bg-white/10 rounded animate-pulse w-48 mx-auto lg:mx-0 mt-4"></div>
  </div>
);

export default function LandingPage() {
  const searchParams = useSearchParams();

  const { setParkingDetails } = useParkingBooking();

  const [parkingData, setParkingData] = useState<ParkingDetails | null>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingZone = async () => {
      try {
        setLoading(true);

        const zoneId = searchParams.get("zoneId") || "ZONE-101";

        const response = await customerService.getParkingZoneById(zoneId);

        setParkingData(response);

        if ((response?.zones?.length ?? 0) > 1) {
          const defaultZone = response?.zones?.[0];

          setSelectedZone(defaultZone);

          setParkingDetails({
            ...response,
            ...defaultZone,
          });
        } else {
          setParkingDetails(response);
        }
      } catch (error) {
        console.error(error);

        toast.error("Failed to load parking details", {
          style: {
            background: "#0B0B0B",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fff",
            borderRadius: "18px",
            padding: "14px 16px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 30px rgba(239,68,68,0.12)",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParkingZone();
  }, [searchParams, setParkingDetails]);

  const handleZoneSelect = (zone: any) => {
    setSelectedZone(zone);

    if (!parkingData) return;

    setParkingDetails({
      ...parkingData,
      ...zone,
    });
  };

  return (
    <div className="h-screen bg-[#0D0D0D] text-white font-sans selection:bg-[#C6F432] selection:text-black overflow-y-auto scrollbar-hide">
      {loading ? (
        <NavbarSkeleton />
      ) : (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C6F432] rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-xl">P</span>
              </div>

              <span className="font-bold tracking-tighter text-lg uppercase">
                ParkSmart
              </span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-4 text-[#9CA3AF]">
              <button className="hover:text-[#C6F432] transition-colors">
                <Globe size={20} />
              </button>

              <button className="hover:text-[#C6F432] transition-colors">
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 lg:pt-32">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Card */}
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden group shadow-2xl lg:order-2">
            {loading ? (
              <ImageSkeleton />
            ) : (
              <>
                <img
                  src={
                    parkingData?.image ||
                    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80"
                  }
                  alt="Premium Parking"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />

                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-[#C6F432] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse" />

                    {parkingData?.availableSpots ? "Available" : "Full"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col lg:order-1 space-y-6 lg:space-y-10">
            <div>
              {loading ? (
                <TitleSkeleton />
              ) : (
                <>
                  <h1
                    className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1]"
                    style={{ fontFamily: "serif" }}
                  >
                    {parkingData?.parkingName
                      ?.split(" ")
                      ?.slice(0, 1)
                      ?.join(" ")}

                    <br />

                    <span className="text-[#C6F432]">
                      {parkingData?.parkingName
                        ?.split(" ")
                        ?.slice(1)
                        ?.join(" ")}
                    </span>
                  </h1>

                  <div className="mt-6 flex items-center gap-3 px-2 text-[#9CA3AF]">
                    <MapPin size={18} className="text-[#C6F432]" />

                    <span className="text-sm md:text-base font-light italic">
                      {parkingData?.address}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Zone Selection  */}
            {!loading && parkingData?.zones && parkingData.zones.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold">
                    Select Parking Zone
                  </p>

                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5 font-mono">
                    {parkingData.zones.length} Zones Available
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {parkingData.zones.map((zone) => {
                    const isActive = selectedZone?.zoneId === zone.zoneId;

                    return (
                      <button
                        key={zone.zoneId}
                        onClick={() => handleZoneSelect(zone)}
                        className={`flex flex-col items-center justify-center py-3.5 px-4 rounded-xl border transition-all duration-300 w-full active:scale-[0.97] ${
                          isActive
                            ? "bg-[#C6F432] border-[#C6F432] text-black shadow-[0_4px_20px_rgba(198,244,50,0.12)]"
                            : "bg-[#1A1A1A] border-white/5 text-[#9CA3AF] hover:border-white/10"
                        }`}
                      >
                        {/* Zone Title */}
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
                            isActive ? "text-black" : "text-white"
                          }`}
                        >
                          {zone.zoneName}
                        </span>

                        {/* Spot Code */}
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            isActive ? "text-black/60" : "text-[#4B5563]"
                          }`}
                        >
                          {zone.spotId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cards */}
            {loading ? (
              <CardsSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rate */}
                <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C6F432]/10 flex items-center justify-center">
                    <Zap className="text-[#C6F432]" size={24} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                      Rate per hour
                    </p>

                    <p className="text-2xl lg:text-3xl font-bold font-mono">
                      ${parkingData?.hourlyRate?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Availability */}
                {/* <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2D7BFF]/10 flex items-center justify-center">
                    <ShieldCheck className="text-[#2D7BFF]" size={24} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                      Spot Availability
                    </p>

                    <p className="text-2xl lg:text-3xl font-bold font-mono uppercase text-white/90">
                      {selectedZone?.availableSpots}/{selectedZone?.totalSpots}
                    </p>
                  </div>
                </div> */}
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 lg:pt-8">
              {loading ? (
                <CTASkeleton />
              ) : (
                <>
                  <Link href="/vehicle-details">
                    <button
                      disabled={
                        loading ||
                        !(
                          selectedZone?.availableSpots ||
                          parkingData?.availableSpots
                        )
                      }
                      className="w-full lg:w-max lg:px-12 bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-md lg:text-lg shadow-[0_10px_30px_rgba(198,244,50,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Booking
                      <ArrowRight size={22} strokeWidth={3} />
                    </button>
                  </Link>

                  <p className="text-center lg:text-left text-[8px] text-[#4B5563] mt-4 uppercase tracking-[0.2em]">
                    Scan • Secure • Park Smart
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
