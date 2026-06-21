"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Zap,
  Globe,
  HelpCircle,
  QrCode,
  CreditCard,
  Clock,
  FileText,
  Camera,
  Database,
  Map as MapIcon,
  BarChart3,
  Settings,
  Users,
  ChevronDown,
  Check,
  Info,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const router = useRouter();

  const { setParkingDetails, setReturnUrl } = useParkingBooking();

  const [parkingData, setParkingData] = useState<ParkingDetails | null>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redesign Landing Page Custom States
  const [zoneInput, setZoneInput] = useState("");
  const [searchingZone, setSearchingZone] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "users" | "officers" | "operators"
  >("users");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mockTime, setMockTime] = useState("01:24:45");

  // QR Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  // live clock forsmartphone mockup in hero section
  useEffect(() => {
    let seconds = 5085; // 1 hour, 24 minutes, 45 seconds
    const interval = setInterval(() => {
      seconds = seconds > 0 ? seconds - 1 : 5085;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      setMockTime(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //Fetch parking details if lotId/zoneId is in URL
  useEffect(() => {
    const fetchParkingZone = async () => {
      try {
        setLoading(true);

        const lotId = searchParams.get("lotId");
        const zoneId = searchParams.get("zoneId");

        const lookupId = lotId || zoneId;
        if (!lookupId) {
          setLoading(false);
          return;
        }

        const currentUrl = `${window.location.pathname}${window.location.search}`;
        setReturnUrl(currentUrl);

        const response = await customerService.getParkingZoneById(lookupId);
        setParkingData(response);

        if ((response?.zones?.length ?? 0) > 0) {
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
  }, [searchParams, setParkingDetails, setReturnUrl]);

  const handleZoneSelect = (zone: any) => {
    setSelectedZone(zone);
    if (!parkingData) return;
    setParkingDetails({
      ...parkingData,
      ...zone,
    });
  };

  //Unified zone lookup handler
  const performZoneLookup = async (id: string) => {
    try {
      setSearchingZone(true);
      const response = await customerService.getParkingZoneById(id);
      setParkingData(response);

      if ((response?.zones?.length ?? 0) > 0) {
        const defaultZone = response?.zones?.[0];
        setSelectedZone(defaultZone);
        setParkingDetails({
          ...response,
          ...defaultZone,
        });
      } else {
        setParkingDetails(response);
      }

      //refresh retains selected lot
      const url = new URL(window.location.href);
      url.searchParams.set("zoneId", id);
      window.history.pushState({}, "", url.toString());

      toast.success("Parking zone found! Proceeding to booking...", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(198,244,50,0.2)",
          color: "#fff",
          borderRadius: "18px",
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Zone or Parking Lot ID not found. Please try again.", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#fff",
          borderRadius: "18px",
        },
      });
    } finally {
      setSearchingZone(false);
    }
  };

  // Manual code check-in lookup handler
  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneInput.trim()) return;
    await performZoneLookup(zoneInput.trim());
  };

  // Camera QR Scanner control methods
  const startScanner = async () => {
    setScannerLoading(true);
    setCameraError(null);
    setIsScannerOpen(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      await new Promise((resolve) => setTimeout(resolve, 350));

      const element = document.getElementById("qr-reader-mount");
      if (!element) {
        throw new Error(
          "Scanner mount container element not found. Please try opening the scanner again.",
        );
      }

      // If there's an active scanner instance already, try to stop it first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (_) {}
      }

      const scanner = new Html5Qrcode("qr-reader-mount");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          let scannedId = decodedText.trim();

          // Parse scanned URL to extract zoneId/lotId if applicable
          try {
            if (
              scannedId.startsWith("http://") ||
              scannedId.startsWith("https://")
            ) {
              const url = new URL(scannedId);
              const lotId = url.searchParams.get("lotId");
              const zoneId = url.searchParams.get("zoneId");
              if (lotId || zoneId) {
                scannedId = (lotId || zoneId) as string;
              }
            }
          } catch (e) {
            console.error("Failed to parse scanned URL", e);
          }

          setZoneInput(scannedId);

          // Stop scanner and close modal
          if (scannerRef.current) {
            try {
              await scannerRef.current.stop();
            } catch (err) {
              console.error("Failed to stop scanner after scan", err);
            }
            scannerRef.current = null;
          }
          setIsScannerOpen(false);

          // Auto trigger lookup
          await performZoneLookup(scannedId);
        },
        () => {
          // Frame errors (silent ignore)
        },
      );
    } catch (err: any) {
      console.error("Failed to start camera scanner:", err);
      setCameraError(
        err?.message ||
          "Could not start camera. Please verify camera permissions are granted.",
      );
    } finally {
      setScannerLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop camera scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScannerOpen(false);
    setCameraError(null);
  };

  // Stop camera stream on page unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch((err: any) =>
            console.error("Error stopping scanner on unmount:", err),
          );
      }
    };
  }, []);

  const faqs = [
    {
      q: "Do I need to download an application to park?",
      a: "No! Parks-Smart is fully web-based. Simply scan the QR code located in your parking zone, enter your vehicle details, and pay securely via Stripe right in your browser. Absolutely zero installs required.",
    },
    {
      q: "How do I extend my active parking session?",
      a: "When you book, you receive a digital receipt and a custom browser session link. Open that link from anywhere to extend your time instantly, without returning to your vehicle.",
    },
    {
      q: "How do parking officers verify that I have paid?",
      a: "Enforcement officers use their specialized dashboard to search for your license plate number or scan active session codes. As long as your session is active, your plate is marked clear.",
    },
    {
      q: "What if I get a penalty ticket? How do I pay or dispute it?",
      a: "If you receive a penalty ticket, you can search for the ticket reference on our portal to view evidence images uploaded by the officer. From there, you can securely pay the fine or submit a formal dispute with explanations and proof images.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans selection:bg-[#C6F432] selection:text-black overflow-x-hidden overflow-y-auto scrollbar-hide relative">
      {/* Background glow highlights */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#C6F432]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-[#C6F432]/3 rounded-full blur-[120px] pointer-events-none" />

      {loading ? (
        <NavbarSkeleton />
      ) : (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-4">
            {/* Logo Section */}
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => {
                if (parkingData) {
                  setParkingData(null);
                  setSelectedZone(null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete("zoneId");
                  url.searchParams.delete("lotId");
                  window.history.pushState({}, "", url.toString());
                }
              }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#C6F432] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(198,244,50,0.3)] flex-shrink-0">
                <span className="text-black font-black text-lg sm:text-xl">
                  P
                </span>
              </div>
              <span className="font-bold tracking-tighter text-sm sm:text-lg uppercase whitespace-nowrap">
                Parks-Smart
              </span>
            </div>

            {/* Navigation links*/}
            {!parkingData && (
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                <a
                  href="#features"
                  className="hover:text-[#C6F432] transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="hover:text-[#C6F432] transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#portals"
                  className="hover:text-[#C6F432] transition-colors"
                >
                  Portals
                </a>
                <a
                  href="#faq"
                  className="hover:text-[#C6F432] transition-colors"
                >
                  FAQ
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {!parkingData ? (
                <button
                  onClick={startScanner}
                  className="bg-white/5 hover:bg-[#C6F432] hover:text-black border border-white/10 hover:border-transparent text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-300 shadow-md whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  Quick Check-In
                </button>
              ) : (
                <div className="flex items-center gap-4 text-[#9CA3AF]">
                  <button className="hover:text-[#C6F432] transition-colors">
                    <Globe size={20} />
                  </button>
                  <button className="hover:text-[#C6F432] transition-colors">
                    <HelpCircle size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* RENDER DYNAMIC CONTENT BASED ON ZONE LOADED OR NOT */}
      {!loading && !parkingData ? (
        <div className="pt-20 md:pt-16 pb-10">
          {/* 1. HERO SECTION */}
          <section
            id="check-in"
            className="max-w-7xl mx-auto px-6 pt-4 md:pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-0 lg:min-h-[72vh] scroll-mt-20"
          >
            <motion.div
              className="lg:col-span-7 flex flex-col space-y-4 lg:space-y-5 text-left pt-2 lg:pt-0 w-full"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Branding Tagline & Main Headers */}
              <div className="space-y-5 md:space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#C6F432]/10 border border-[#C6F432]/20 px-3 py-0.5 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 bg-[#C6F432] rounded-full animate-ping" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#C6F432]">
                    Web-First Smart Parking System
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white">
                  Seamless Parking. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6F432] via-[#e2ff7a] to-[#a0cb1b]">
                    No App Installation.
                  </span>
                </h1>

                <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg font-light leading-relaxed max-w-xl">
                  Scan, select duration, and check in. A complete digital
                  ecosystem linking users, operators, and enforcement officers
                  in one dashboard.
                </p>
              </div>

              {/* Check-In Form Widget  */}
              <div className="space-y-5 w-full max-w-md relative z-10">
                {/* 1. Main QR Code Scan Button */}
                <button
                  type="button"
                  onClick={startScanner}
                  className="w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all shadow-[0_8px_24px_rgba(198,244,50,0.12)] flex items-center justify-center gap-2.5 active:scale-[0.98] group cursor-pointer"
                >
                  <QrCode
                    size={18}
                    className="text-black group-hover:scale-110 transition-transform"
                  />
                  Scan QR Code to Park
                </button>

                {/* 2. Divider */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="h-[1px] bg-white/5 flex-1" />
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    Or Enter ID Manually
                  </span>
                  <div className="h-[1px] bg-white/5 flex-1" />
                </div>

                {/* 3. Secondary Manual Entry Form */}
                <form onSubmit={handleManualCheckIn} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter Your Lot Id"
                    value={zoneInput}
                    onChange={(e) => setZoneInput(e.target.value)}
                    className="flex-1 bg-[#121212] border border-white/10 focus:border-[#C6F432] rounded-xl py-2.5 px-4 text-xs outline-none transition-all duration-300 text-white placeholder-gray-600 focus:shadow-[0_0_15px_rgba(198,244,50,0.04)]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={searchingZone}
                    className="bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 hover:border-[#C6F432]/30 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 min-w-[80px] flex items-center justify-center"
                  >
                    {searchingZone ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Find"
                    )}
                  </button>
                </form>

                {/* Helper text and features anchor link */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10px] text-gray-500 uppercase tracking-widest pl-1 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Check size={12} className="text-[#C6F432]" /> Instant Scan
                    & Park
                  </span>
                  <span className="flex items-center gap-1">
                    <Check size={12} className="text-[#C6F432]" /> Stripe
                    Secured
                  </span>
                  <a
                    href="#features"
                    className="text-[#C6F432] hover:text-[#d4ff45] transition-colors underline underline-offset-4 decoration-1 font-bold tracking-widest ml-auto sm:ml-0"
                  >
                    Explore Features
                  </a>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-18 md:pt-4 border-t border-white/5 max-w-md w-full">
                <div>
                  <h4 className="text-base sm:text-xl font-bold font-mono text-[#C6F432]">
                    0
                  </h4>
                  <p className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-500 mt-1">
                    App Installs
                  </p>
                </div>
                <div>
                  <h4 className="text-lg sm:text-2xl font-bold font-mono text-[#C6F432]">
                    10s
                  </h4>
                  <p className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-500 mt-1">
                    Booking Time
                  </p>
                </div>
                <div>
                  <h4 className="text-lg sm:text-2xl font-bold font-mono text-[#C6F432]">
                    100%
                  </h4>
                  <p className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-500 mt-1">
                    Digital Receipts
                  </p>
                </div>
              </div>

              <div className="h-20 sm:h-28 lg:hidden" />
            </motion.div>

            {/* mockup */}
            <motion.div
              className="lg:col-span-5 flex justify-center lg:justify-end pt-8 lg:pt-0 pb-8 lg:pb-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[48px] border-4 border-gray-800 bg-[#0A0A0A] p-2.5 shadow-[0_0_60px_rgba(198,244,50,0.08)] flex flex-col justify-between overflow-hidden group">
                {/* Speaker pill */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-gray-800 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-10 h-1 bg-gray-900 rounded-full" />
                </div>

                {/* Internal Screen Content */}
                <div className="w-full h-full bg-[#0D0D0D] rounded-[38px] p-4 flex flex-col justify-between overflow-hidden relative border border-white/5 pt-6">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>19:42</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-gray-600 rounded-sm p-0.5 flex items-center">
                        <div className="w-2 h-full bg-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-[#C6F432] rounded flex items-center justify-center">
                        <span className="text-black font-black text-xs">P</span>
                      </div>
                      <span className="font-extrabold text-[10px] tracking-tight uppercase">
                        Parks-Smart
                      </span>
                    </div>
                    <span className="bg-[#C6F432]/10 border border-[#C6F432]/20 text-[#C6F432] px-2 py-0.5 rounded-full text-[8px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  {/* Active Parking Session */}
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="bg-[#121212] border border-[#C6F432]/20 rounded-2xl p-3.5 space-y-3.5 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#C6F432]/5 rounded-full blur-xl pointer-events-none" />

                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">
                            Currently Parked
                          </p>
                          <h4 className="text-xs font-bold text-white mt-0.5">
                            Downtown Main Lot
                          </h4>
                        </div>
                        <MapPin size={12} className="text-[#C6F432]" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[8px] text-gray-500 uppercase tracking-wider">
                          Remaining Time
                        </p>
                        <p className="text-xl font-mono font-black text-[#C6F432] tracking-wider animate-pulse">
                          {mockTime}
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[8px]">
                        <div>
                          <span className="text-gray-500 block uppercase">
                            Zone
                          </span>
                          <span className="text-white font-bold">
                            Zone-B (Spot 04)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">
                            Vehicle Plate
                          </span>
                          <span className="text-white font-bold font-mono">
                            NY-K789
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#C6F432]/10 flex items-center justify-center">
                          <Clock size={12} className="text-[#C6F432]" />
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium">
                          Need more time?
                        </span>
                      </div>
                      <button className="w-full bg-[#C6F432] text-black font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition-all shadow-md active:scale-95">
                        Extend Session
                      </button>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="text-center text-[7px] text-gray-600 uppercase tracking-widest border-t border-white/5 pt-2">
                    Secured by Stripe Payments
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* PRODUCT FEATURES */}
          <section
            id="features"
            className="max-w-7xl mx-auto px-6 py-12 md:py-20 border-t border-white/5 scroll-mt-20"
          >
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                One Platform.{" "}
                <span className="text-[#C6F432]">Full Ecosystem.</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
                Parks-Smart integrates modules for users checking in on the
                spot, officers checking violations, and managers reviewing
                financials.
              </p>
            </div>

            {/* Feature Tabs Nav */}
            <div className="flex justify-center p-1 bg-[#121212]/80 border border-white/5 rounded-2xl max-w-lg mx-auto mb-10 sm:mb-16 relative z-10">
              <button
                onClick={() => setActiveTab("users")}
                className={`relative flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === "users"
                    ? "text-black z-10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {activeTab === "users" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#C6F432] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                Users
              </button>
              <button
                onClick={() => setActiveTab("officers")}
                className={`relative flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === "officers"
                    ? "text-black z-10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {activeTab === "officers" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#C6F432] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                Officers
              </button>
              <button
                onClick={() => setActiveTab("operators")}
                className={`relative flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === "operators"
                    ? "text-black z-10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {activeTab === "operators" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#C6F432] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                Operators
              </button>
            </div>

            {/* Tabs Content */}
            <AnimatePresence mode="wait">
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                >
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <QrCode
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Instant Scan & Park
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Simply pull up your smartphone camera, point it at the QR
                      code board, and start booking. No account setup required.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <Clock
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Extend From Anywhere
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Enjoy your meeting or lunch without worries. Extend your
                      active session duration directly through the web page on
                      your phone.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <CreditCard
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Stripe Secured Payments
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Safely submit payments with credit or debit cards,
                      integrated directly with Stripe. Secure, fast, and
                      completely digital.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "officers" && (
                <motion.div
                  key="officers"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                >
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <Camera
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      License Plate Lookup
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Search plates instantly to verify current ticket status
                      and validity. Keep enforcement runs efficient and
                      paperless.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <FileText
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Evidence Violations
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Take photos and attach them directly to penalty notices.
                      Ensures maximum transparency and defensibility ofissued
                      fines.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <Database
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Offline Ticket Logging
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Log details offline in underground or poor signal
                      parkades. The system syncs files automatically when
                      online.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "operators" && (
                <motion.div
                  key="operators"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                >
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <BarChart3
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Interactive Dashboard
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Track active sessions, occupied capacity, revenue trends,
                      outstanding dues, and enforcement logs in one location.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <Settings
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Dynamic Pricing & Zones
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Edit hourly rates, manage active time windows, generate
                      new QR codes for zones, and customize tax rates instantly.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 hover:border-[#C6F432]/30 hover:shadow-[0_0_30px_rgba(198,244,50,0.03)] transition-all duration-500 rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-xl flex items-center justify-center">
                      <Users
                        size={20}
                        className="text-[#C6F432] sm:scale-110"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold">
                      Officer Administration
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Manage officer accounts, monitor ticket histories, assign
                      lots, and coordinate field enforcement teams efficiently.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* HOW IT WORKS */}
          <section
            id="how-it-works"
            className="max-w-7xl mx-auto px-6 py-12 md:py-20 border-t border-white/5 scroll-mt-20"
          >
            <div className="text-center space-y-3 mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                How It Works in <span className="text-[#C6F432]">4 Steps</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
                Get up and running within seconds. Learn how easy smart parking
                is.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {[
                {
                  step: "01",
                  title: "Scan the QR Code",
                  desc: "Find the physical Parks-Smart QR code signage near your parking bay and scan it using your smartphone's default camera.",
                },
                {
                  step: "02",
                  title: "Enter Details",
                  desc: "Select your desired parking duration (1H, 2H, Full Day, etc.) and type in your plate number and vehicle details.",
                },
                {
                  step: "03",
                  title: "Pay Securely",
                  desc: "Complete the Stripe checkout securely. You will instantly receive a digital invoice and a unique browser session.",
                },
                {
                  step: "04",
                  title: "Extend Anytime",
                  desc: "If your tasks are running late, simply open your digital receipt and add more time with a single tap from anywhere.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative flex flex-col space-y-2 sm:space-y-3 bg-[#0A0A0A] border border-white/5 p-5 sm:p-6 rounded-2xl hover:border-[#C6F432]/20 transition-all duration-300"
                >
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#C6F432]/40 block">
                    {item.step}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* PORTAL LOGIN ACCESSIBILITY */}
          <section
            id="portals"
            className="max-w-7xl mx-auto px-6 py-12 md:py-20 border-t border-white/5 scroll-mt-20"
          >
            <div className="text-center space-y-3 mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                Administration &{" "}
                <span className="text-[#C6F432]">Enforcement</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
                Authorized staff can log in to specialized dashboards below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
              {/* Operator Portal */}
              <div className="bg-gradient-to-b from-[#0E0E0E] to-[#080808] border border-white/5 hover:border-[#C6F432]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6 shadow-xl transition-all duration-300">
                <div className="space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="text-[#C6F432]" size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                    Parking Lots Operator
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Access administrative settings to track sales, design zones,
                    manage officer shifts, issue plans, and configure payments.
                  </p>
                </div>
                <Link href="/admin/login">
                  <button className="w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-3 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md">
                    Operator Portal
                    <ExternalLink size={14} />
                  </button>
                </Link>
              </div>

              {/* Officer Portal */}
              <div className="bg-gradient-to-b from-[#0E0E0E] to-[#080808] border border-white/5 hover:border-[#C6F432]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6 shadow-xl transition-all duration-300">
                <div className="space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C6F432]/10 rounded-2xl flex items-center justify-center">
                    <Camera className="text-[#C6F432]" size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                    Enforcement Officer
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Check parked plates, view active zone sessions, log
                    offlines, upload evidence photos, and issue penalty tickets.
                  </p>
                </div>
                <Link href="/officer/login">
                  <button className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-white font-black py-3 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95">
                    Officer Portal
                    <ExternalLink size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/*  FAQ ACCORDION */}
          <section
            id="faq"
            className="max-w-4xl mx-auto px-6 py-12 md:py-20 border-t border-white/5 scroll-mt-20"
          >
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked{" "}
                <span className="text-[#C6F432]">Questions</span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                Everything you need to know about the Parks-Smart platform.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-white/5 bg-[#090909] rounded-xl sm:rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full py-4 px-5 sm:py-5 sm:px-6 flex justify-between items-center text-left text-white hover:text-[#C6F432] transition-colors focus:outline-none font-bold text-xs sm:text-sm md:text-base"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-500 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#C6F432]" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-1 sm:px-6 sm:pb-5 sm:pt-1 text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-white/5">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

          {/*  FOOTER */}
          <footer className="max-w-7xl mx-auto px-6 pt-16 pb-8 border-t border-white/5 text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#C6F432] rounded flex items-center justify-center">
                  <span className="text-black font-black text-sm">P</span>
                </div>
                <span className="font-extrabold text-sm tracking-tight text-white uppercase">
                  Parks-Smart
                </span>
              </div>
              <p className="text-xs text-center md:text-right">
                Scan • Secure • Park Smart
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-wider border-t border-white/5 pt-6">
              <span>
                © {new Date().getFullYear()} Parks-Smart. All rights reserved.
              </span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 lg:pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image Card */}
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden group shadow-2xl lg:order-2">
              {loading ? (
                <ImageSkeleton />
              ) : (
                <>
                  <img
                    src={selectedZone?.image || parkingData?.image}
                    alt={
                      (selectedZone?.zoneName || parkingData?.parkingName) ??
                      "Premium Parking"
                    }
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80";
                    }}
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

            {/* Content Column */}
            <div className="flex flex-col lg:order-1 space-y-6 lg:space-y-10">
              <div>
                {loading ? (
                  <TitleSkeleton />
                ) : (
                  <>
                    <h1
                      className="text-5xl md:text-4xl lg:text-6xl font-medium tracking-tight leading-[1.1]"
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
              {!loading &&
                parkingData?.zones &&
                parkingData.zones.length > 1 && (
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
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
                                isActive ? "text-black" : "text-white"
                              }`}
                            >
                              {zone.zoneName}
                            </span>
                            {zone.address && (
                              <span
                                className={`text-[10px] font-mono font-bold ${
                                  isActive ? "text-black/60" : "text-[#4B5563]"
                                }`}
                                title={zone.address}
                              >
                                {zone.address}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Rate Card */}
              {loading ? (
                <CardsSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C6F432]/10 flex items-center justify-center">
                      <Zap className="text-[#C6F432]" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                        Rate per hour
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold font-mono">
                        $
                        {(
                          selectedZone?.hourlyRate ??
                          parkingData?.hourlyRate ??
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed CTA */}
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
      )}

      {/* Camera QR Scanner Modal Overlay */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0D0D0D] border border-white/10 w-full max-w-md rounded-3xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C6F432]/10 rounded-lg flex items-center justify-center">
                    <QrCode size={18} className="text-[#C6F432]" />
                  </div>
                  <span className="font-bold tracking-tight text-white uppercase text-sm">
                    Scan QR Code
                  </span>
                </div>
                <button
                  onClick={stopScanner}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Camera Scanner Viewport */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-[#050505] rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center mb-6">
                {scannerLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0D0D0D] text-xs text-gray-500 font-mono">
                    <div className="w-6 h-6 border-2 border-[#C6F432] border-t-transparent rounded-full animate-spin" />
                    <span>Accessing Camera...</span>
                  </div>
                )}

                {cameraError ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center gap-3 bg-[#0D0D0D] text-xs text-rose-500 font-mono">
                    <Info size={24} />
                    <span>{cameraError}</span>
                  </div>
                ) : (
                  <div
                    id="qr-reader-mount"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Laser animation and target box */}
                {!scannerLoading && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[200px] h-[200px] border border-dashed border-[#C6F432]/30 rounded-xl relative flex items-center justify-center">
                      {/* Target scan lines */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C6F432]" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#C6F432]" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#C6F432]" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C6F432]" />

                      {/* Laser Line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-[#C6F432] shadow-[0_0_8px_rgba(198,244,50,0.8)]"
                        style={{
                          animation: "laser-scan 2.5s infinite linear",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Guide text */}
              <div className="text-center space-y-1.5 mb-2">
                <p className="text-xs text-gray-400 font-light">
                  Align the PARKS-SMART QR code inside the box.
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Automatic Lookup & Redirect
                </p>
              </div>

              {/* Laser animation styles */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                @keyframes laser-scan {
                  0% { transform: translateY(0); }
                  50% { transform: translateY(198px); }
                  100% { transform: translateY(0); }
                }
              `,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
