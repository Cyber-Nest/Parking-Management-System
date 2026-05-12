"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Car,
  TrendingUp,
  DollarSign,
  Ticket,
  Clock,
  Users,
  Eye,
  Building2,
  ParkingCircle,
  Navigation,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import toast from "react-hot-toast";

// Services
import {
  locationPerformanceService,
  LocationDetails,
  LocationPerformanceMetrics,
  LocationRevenueTrend,
  LocationSessionTrend,
  LocationTicketData,
  LocationOfficerData,
  LocationVehicleHistory,
  PeakHourData,
} from "@/services/location-performance.service";

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2.5 mt-10 mb-5 pb-2 border-b border-[var(--color-border)]">
    <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/10 shadow-inner">
      {icon}
    </div>
    <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
      {title}
    </h3>
  </div>
);

const KpiCard = ({ title, value, trend, icon: Icon, colorClass }: any) => (
  <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20 hover:border-[var(--color-primary)]/20 transition-all group">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 opacity-60">
        {Icon && (
          <Icon
            size={14}
            className="text-[var(--color-primary)] group-hover:scale-110 transition-transform"
          />
        )}
        <span className="text-[10px] font-black uppercase tracking-wider">
          {title}
        </span>
      </div>
      {trend !== undefined && (
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${trend > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p
      className={`text-2xl font-black tracking-tighter ${colorClass || "text-[var(--color-text-primary)]"}`}
    >
      {value}
    </p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const colors: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    unpaid: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    void: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${colors[s] || "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {status}
    </span>
  );
};

export const LocationDetailsDrawer = ({
  isOpen,
  onClose,
  locationId,
  locationName,
}: any) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<LocationDetails | null>(null);
  const [metrics, setMetrics] = useState<LocationPerformanceMetrics | null>(
    null,
  );
  const [revenueTrend, setRevenueTrend] = useState<LocationRevenueTrend[]>([]);
  const [sessionTrend, setSessionTrend] = useState<LocationSessionTrend[]>([]);
  const [tickets, setTickets] = useState<LocationTicketData[]>([]);
  const [officers, setOfficers] = useState<LocationOfficerData[]>([]);
  const [vehicles, setVehicles] = useState<LocationVehicleHistory[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);

  useEffect(() => {
    if (isOpen && locationId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [
            detailsRes,
            metricsRes,
            revenueRes,
            sessionRes,
            ticketsRes,
            officersRes,
            vehiclesRes,
            peakRes,
          ] = await Promise.all([
            locationPerformanceService.getLocationDetails(locationId),
            locationPerformanceService.getLocationMetrics(locationId),
            locationPerformanceService.getLocationRevenueTrend(locationId),
            locationPerformanceService.getLocationSessionTrend(locationId),
            locationPerformanceService.getLocationTickets(locationId),
            locationPerformanceService.getLocationOfficers(locationId),
            locationPerformanceService.getLocationVehicleHistory(locationId),
            locationPerformanceService.getLocationPeakHours(locationId),
          ]);
          setDetails(detailsRes);
          setMetrics(metricsRes);
          setRevenueTrend(revenueRes);
          setSessionTrend(sessionRes);
          setTickets(ticketsRes);
          setOfficers(officersRes);
          setVehicles(vehiclesRes);
          setPeakHours(peakRes);
        } catch (error) {
          toast.error("Data Intelligence retrieval failed");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, locationId]);

  if (!locationId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-3xl bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="p-8 py-6 border-b border-[var(--color-border)] flex justify-between items-center  sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] uppercase flex items-center gap-2">
                  <Navigation
                    size={24}
                    className="text-[var(--color-primary)]"
                  />
                  Zone Analysis
                </h2>
                <p className="text-xs font-mono bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] px-2 py-0.5 rounded inline-block mt-1">
                  UUID: {locationId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
              {loading ? (
                <div className="animate-pulse space-y-8">
                  <div className="h-40 bg-[var(--color-surface-soft)] rounded-[2.5rem]" />
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Hero Summary */}
                  <div className="mb-8 p-8 rounded-[2rem] bg-[var(--color-primary)]/70 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase font-black opacity-50 tracking-[0.3em] mb-2">
                          Location Identifier
                        </p>
                        <h1 className="text-3xl font-black tracking-tighter mb-1">
                          {details?.name}
                        </h1>
                        <p className="text-xs opacity-70 font-medium flex items-center gap-1.5">
                          <MapPin size={12} className="text-indigo-400" />{" "}
                          {details?.address}
                        </p>
                      </div>
                      <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] uppercase font-black opacity-50">
                          Zone Classification
                        </p>
                        <p className="text-xs font-bold text-white tracking-widest">
                          {details?.locationType}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px]" />
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard
                      title="Total Revenue"
                      value={`$${metrics?.dailyRevenue.toLocaleString()}`}
                      icon={DollarSign}
                    />
                    <KpiCard
                      title="Active Sessions"
                      value={metrics?.totalSessions}
                      icon={Car}
                    />
                    <KpiCard
                      title="Citations"
                      value={metrics?.ticketsIssued}
                      icon={Ticket}
                      colorClass="text-orange-500"
                    />
                    <KpiCard
                      title="Occupancy"
                      value={`${metrics?.occupancyRate.toFixed(1)}%`}
                      icon={ParkingCircle}
                    />
                  </div>

                  {/*  Location Details Table Style */}
                  <SectionTitle
                    icon={<Building2 size={18} />}
                    title="Zone Specifications"
                  />
                  <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-[var(--color-surface-soft)]/20 border border-[var(--color-border)]">
                    <div>
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">
                        Max Capacity
                      </p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">
                        {details?.totalSpots} Controlled Spots
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">
                        Operational Type
                      </p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">
                        {details?.locationType}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">
                        Current Availability
                      </p>
                      <p className="text-sm font-bold text-emerald-500">
                        {Math.floor(
                          (details?.totalSpots || 0) *
                            (1 - (metrics?.occupancyRate || 0) / 100),
                        )}{" "}
                        Spots Open
                      </p>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="p-6 rounded-3xl bg-[var(--color-surface-soft)]/10 border border-[var(--color-border)]">
                      <SectionTitle
                        icon={<TrendingUp size={16} />}
                        title="Revenue Pulse"
                      />
                      <div className="h-[200px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueTrend}>
                            <defs>
                              <linearGradient
                                id="colorRev"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--color-primary)"
                                  stopOpacity={0.2}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--color-primary)"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              strokeOpacity={0.1}
                            />
                            <XAxis
                              dataKey="date"
                              fontSize={10}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              fontSize={10}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="var(--color-primary)"
                              strokeWidth={2}
                              fill="url(#colorRev)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[var(--color-surface-soft)]/10 border border-[var(--color-border)]">
                      <SectionTitle
                        icon={<Clock size={16} />}
                        title="Load Intensity"
                      />
                      <div className="h-[200px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={peakHours}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              strokeOpacity={0.1}
                            />
                            <XAxis
                              dataKey="hour"
                              fontSize={10}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              cursor={{ fill: "rgba(0,0,0,0.02)" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                              }}
                            />
                            <Bar
                              dataKey="vehicles"
                              fill="var(--color-primary)"
                              radius={[4, 4, 0, 0]}
                              barSize={15}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Recent Tickets Table */}
                  <SectionTitle
                    icon={<Ticket size={18} />}
                    title="Enforcement Activity"
                  />
                  <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-soft)]/10">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[var(--color-surface-soft)]/50 border-b border-[var(--color-border)]">
                        <tr className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                          <th className="px-5 py-4">Ticket ID</th>
                          <th className="px-5 py-4">Timeline</th>
                          <th className="px-5 py-4">Violation Details</th>
                          <th className="px-5 py-4">Amount</th>
                          <th className="px-5 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]/50">
                        {tickets.map((t, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-white/40 transition-colors"
                          >
                            <td className="px-5 py-4 font-mono font-bold text-[var(--color-primary)]">
                              {t.ticketId}
                            </td>
                            <td className="px-5 py-4 text-[var(--color-text-muted)] font-medium">
                              {t.date}
                            </td>
                            <td className="px-5 py-4 text-[var(--color-text-primary)] font-bold">
                              {t.violationType}
                            </td>
                            <td className="px-5 py-4 font-black">
                              ${t.amount}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <StatusBadge status={t.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Officers Working  */}
                  <SectionTitle
                    icon={<Users size={18} />}
                    title="Personnel Deployment"
                  />
                  <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[var(--color-surface-soft)]/50 border-b border-[var(--color-border)]">
                        <tr className="text-[9px] font-black uppercase tracking-widest">
                          <th className="px-5 py-4 text-white">
                            Officer Identity
                          </th>
                          <th className="px-5 py-4">UID</th>
                          <th className="px-5 py-4">Quota</th>
                          <th className="px-5 py-4">Valuation</th>
                          <th className="px-5 py-4 text-right">Last Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {officers.map((off, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-[var(--color-surface-soft)]/20 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-black">
                                  {off.name.charAt(0)}
                                </div>
                                <span className="font-bold text-[var(--color-text-primary)]">
                                  {off.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-[var(--color-text-muted)]">
                              {off.officerId}
                            </td>
                            <td className="px-5 py-4 font-black text-orange-500">
                              {off.ticketsIssued} Citations
                            </td>
                            <td className="px-5 py-4 font-black">
                              ${off.revenue}
                            </td>
                            <td className="px-5 py-4 text-right font-medium text-[var(--color-text-muted)]">
                              {off.lastActive}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vehicle History */}
                  <SectionTitle
                    icon={<Car size={18} />}
                    title="Entity Traffic Logs"
                  />
                  <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-soft)]/5">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
                        <tr className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                          <th className="px-5 py-4">Plate Identifier</th>
                          <th className="px-5 py-4">Class</th>
                          <th className="px-5 py-4">Session Timestamp</th>
                          <th className="px-5 py-4">Active Duration</th>
                          <th className="px-5 py-4 text-right">Settlement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {vehicles.map((v, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-[var(--color-surface-soft)]/20 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <span className="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-primary)] rounded font-mono font-black text-[var(--color-text-primary)] shadow-sm uppercase">
                                {v.plateNumber}
                              </span>
                            </td>
                            <td className="px-5 py-4 uppercase font-bold text-[var(--color-text-muted)]">
                              {v.vehicleType}
                            </td>
                            <td className="px-5 py-4 font-medium">
                              {v.sessionDate}
                            </td>
                            <td className="px-5 py-4 font-bold text-indigo-400">
                              {v.duration}
                            </td>
                            <td className="px-5 py-4 text-right font-black text-[var(--color-text-primary)]">
                              ${v.amountPaid}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
