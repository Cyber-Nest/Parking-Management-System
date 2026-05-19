// "use client";

// import { useEffect, useMemo, useState } from "react";

// import {
//   Building2,
//   Download,
//   Edit,
//   Plus,
//   Power,
//   Search,
//   MapPin,
//   QrCode,
//   DollarSign,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// import { motion, AnimatePresence } from "framer-motion";
// import toast from "react-hot-toast";

// import {
//   parkingOwnerService,
//   ParkingOwner,
//   ParkingZone,
// } from "@/services/parking-owner.service";

// import {
//   ParkingOwnerFormDrawer,
//   ParkingOwnerFormData,
// } from "@/components/parking-owners/ParkingOwnerFormDrawer";

// import { StatCard } from "@/components/common/StatCard";

// const defaultFormData: ParkingOwnerFormData = {
//   ownerName: "",
//   ownerEmail: "",
//   ownerPhone: "",
//   companyName: "",
//   parkingName: "",
//   parkingAddress: "",
//   parkingImage: null,
//   averageRate: "",
//   zones: [],
//   isActive: true,
// };

// export default function ParkingOwnersPage() {
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [parkingOwners, setParkingOwners] = useState<ParkingOwner[]>([]);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [editingParkingOwner, setEditingParkingOwner] =
//     useState<ParkingOwner | null>(null);
//   const [formData, setFormData] =
//     useState<ParkingOwnerFormData>(defaultFormData);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 9; // 3x3 grid

//   const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
//   const [selectedOwner, setSelectedOwner] = useState<ParkingOwner | null>(null);

//   useEffect(() => {
//     fetchParkingOwners();
//   }, []);

//   const fetchParkingOwners = async () => {
//     try {
//       setLoading(true);
//       const response = await parkingOwnerService.getParkingOwners();
//       setParkingOwners(response);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load parking owners");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredParkingOwners = useMemo(() => {
//     return parkingOwners.filter((owner) => {
//       const searchValue = search.toLowerCase();
//       return (
//         owner.ownerName.toLowerCase().includes(searchValue) ||
//         owner.parkingName.toLowerCase().includes(searchValue) ||
//         owner.ownerEmail.toLowerCase().includes(searchValue)
//       );
//     });
//   }, [parkingOwners, search]);

//   const totalPages = Math.ceil(filteredParkingOwners.length / itemsPerPage);
//   const paginatedOwners = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredParkingOwners.slice(start, start + itemsPerPage);
//   }, [filteredParkingOwners, currentPage]);

//   // Reset page when search changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search]);

//   const handleOpenCreate = () => {
//     setEditingParkingOwner(null);
//     setFormData(defaultFormData);
//     setIsDrawerOpen(true);
//   };

//   const handleEdit = (parkingOwner: ParkingOwner) => {
//     setEditingParkingOwner(parkingOwner);
//     setFormData({
//       ownerName: parkingOwner.ownerName,
//       ownerEmail: parkingOwner.ownerEmail,
//       ownerPhone: parkingOwner.ownerPhone,
//       companyName: parkingOwner.companyName || "",
//       parkingName: parkingOwner.parkingName,
//       parkingAddress: parkingOwner.parkingAddress,
//       parkingImage: parkingOwner.parkingImage,
//       averageRate: parkingOwner.averageRate.toString(),
//       zones: parkingOwner.zones,
//       isActive: parkingOwner.isActive,
//     });
//     setIsDrawerOpen(true);
//   };

//   const handleFormChange = (field: keyof ParkingOwnerFormData, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (data: ParkingOwnerFormData) => {
//     try {
//       if (!data.ownerName || !data.ownerEmail || !data.ownerPhone) {
//         toast.error("Please complete owner details");
//         return;
//       }

//       if (!data.parkingName || !data.parkingAddress) {
//         toast.error("Please complete parking details");
//         return;
//       }

//       if (!data.zones.length) {
//         toast.error("Please add at least one parking zone");
//         return;
//       }

//       const payload: ParkingOwner = {
//         id: editingParkingOwner?.id || `PO-${Date.now()}`,
//         ownerName: data.ownerName,
//         ownerEmail: data.ownerEmail,
//         ownerPhone: data.ownerPhone,
//         companyName: data.companyName,
//         parkingName: data.parkingName,
//         parkingAddress: data.parkingAddress,
//         parkingImage: data.parkingImage || "",
//         averageRate: Number(data.averageRate),
//         zones: data.zones,
//         qrCodeUrl:
//           editingParkingOwner?.qrCodeUrl ||
//           `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://parksmart.com/${Date.now()}`,
//         isActive: data.isActive,
//         createdAt: editingParkingOwner?.createdAt || new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };

//       if (editingParkingOwner) {
//         await parkingOwnerService.updateParkingOwner(
//           editingParkingOwner.id,
//           payload,
//         );
//         toast.success("Parking owner updated");
//         setParkingOwners((prev) =>
//           prev.map((item) =>
//             item.id === editingParkingOwner.id ? payload : item,
//           ),
//         );
//       } else {
//         await parkingOwnerService.createParkingOwner(payload);
//         toast.success("Parking owner created");
//         setParkingOwners((prev) => [payload, ...prev]);
//       }

//       setIsDrawerOpen(false);
//     } catch (error) {
//       console.error(error);
//       toast.error("Something went wrong");
//     }
//   };

//   const handleToggleStatus = async (id: string) => {
//     try {
//       await parkingOwnerService.toggleParkingOwnerStatus(id);
//       setParkingOwners((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, isActive: !item.isActive } : item,
//         ),
//       );
//       toast.success("Parking owner status updated");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleDownloadQR = async (qrUrl: string) => {
//     try {
//       const qr = await parkingOwnerService.downloadQRCode(qrUrl);
//       window.open(qr, "_blank");
//       toast.success("QR downloaded");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to download QR");
//     }
//   };

//   const handleViewDetails = (owner: ParkingOwner) => {
//     setSelectedOwner(owner);
//     setIsViewDrawerOpen(true);
//   };

//   const totalOwners = parkingOwners.length;
//   const activeParking = parkingOwners.filter((item) => item.isActive).length;
//   const totalZones = parkingOwners.reduce(
//     (acc, item) => acc + item.zones.length,
//     0,
//   );
//   const averageRate =
//     parkingOwners.length > 0
//       ? (
//           parkingOwners.reduce((acc, item) => acc + item.averageRate, 0) /
//           parkingOwners.length
//         ).toFixed(1)
//       : "0";

//   const LoadingSkeleton = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {Array.from({ length: 6 }).map((_, index) => (
//         <div
//           key={index}
//           className="h-[430px] rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse"
//         />
//       ))}
//     </div>
//   );

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
//           <div>
//             <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
//               Parking{" "}
//               <span className="text-[var(--color-primary)]">Owners</span>
//             </h1>

//             <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
//               Manage parking owners, booking zones, QR access, and customer
//               parking setup.
//             </p>
//           </div>

//           <button
//             onClick={handleOpenCreate}
//             className="btn-primary px-6 py-3 flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20"
//           >
//             <Plus size={18} strokeWidth={3} />
//             Create Parking Owner
//           </button>
//         </div>

//         {/* Stats  */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           <StatCard
//             icon={
//               <Building2 size={22} className="text-[var(--color-primary)]" />
//             }
//             title="Total Owners"
//             value={totalOwners}
//           />
//           <StatCard
//             icon={<QrCode size={22} className="text-[var(--color-primary)]" />}
//             title="Active Parking"
//             value={activeParking}
//           />
//           <StatCard
//             icon={<MapPin size={22} className="text-[var(--color-primary)]" />}
//             title="Total Zones"
//             value={totalZones}
//           />
//           <StatCard
//             icon={
//               <DollarSign size={22} className="text-[var(--color-primary)]" />
//             }
//             title="Average Rate"
//             value={`$${averageRate}/hr`}
//           />
//         </div>

//         {/* Toolbar */}
//         <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
//           <div className="relative flex-1">
//             <Search
//               size={18}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
//             />
//             <input
//               type="text"
//               placeholder="Search parking owners by name, parking name or email..."
//               className="input pl-11 w-full"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Cards Grid */}
//         {loading ? (
//           <LoadingSkeleton />
//         ) : filteredParkingOwners.length === 0 ? (
//           <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-14 text-center">
//             <Building2
//               size={44}
//               className="mx-auto text-[var(--color-text-muted)]"
//             />
//             <h3 className="text-xl font-black text-[var(--color-text-primary)] mt-5">
//               No Parking Owners Found
//             </h3>
//             <p className="text-sm text-[var(--color-text-secondary)] mt-2">
//               Create your first parking owner to enable customer QR booking
//               flow.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//               {filteredParkingOwners.map((owner) => (
//                 <div
//                   key={owner.id}
//                   className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-3xl overflow-hidden shadow-sm shadow-black/[0.01] hover:shadow-md hover:border-[var(--color-border)] transition-all duration-300 flex flex-col group"
//                 >
//                   {/* Image Banner Section */}
//                   <div className="relative h-48 overflow-hidden bg-[var(--color-surface-soft)]">
//                     <img
//                       src={owner.parkingImage || "/placeholder-parking.jpg"}
//                       alt={owner.parkingName}
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
//                     />

//                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//                     {/* Dynamic Status Badge */}
//                     <div className="absolute top-4 right-4">
//                       <span
//                         className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
//                           owner.isActive
//                             ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
//                             : "bg-red-500/10 border-red-500/30 text-red-400"
//                         }`}
//                       >
//                         {owner.isActive ? "Active" : "Disabled"}
//                       </span>
//                     </div>

//                     {/* Banner Details */}
//                     <div className="absolute bottom-4 left-5 right-5 space-y-0.5">
//                       <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-sm truncate">
//                         {owner.parkingName}
//                       </h3>
//                       <p className="text-xs text-white/70 font-medium truncate">
//                         by {owner.ownerName}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Card Body Component */}
//                   <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
//                     {/* Core Info Details */}
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-2.5 text-[var(--color-text-secondary)]">
//                         <MapPin
//                           size={15}
//                           className="text-[var(--color-primary)] mt-0.5 shrink-0"
//                         />
//                         <p className="text-xs font-medium leading-relaxed line-clamp-2">
//                           {owner.parkingAddress}
//                         </p>
//                       </div>

//                       {/* Stats Indicators */}
//                       <div className="grid grid-cols-2 gap-4 bg-[var(--color-surface-soft)]/40 border border-[var(--color-border)]/40 rounded-2xl px-4 py-3">
//                         <div>
//                           <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">
//                             Avg Hourly Rate
//                           </p>
//                           <p className="text-base font-bold text-[var(--color-text)] mt-0.5">
//                             ${owner.averageRate}
//                             <span className="text-xs font-medium text-[var(--color-text-muted)]">
//                               /hr
//                             </span>
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">
//                             Total Zones
//                           </p>
//                           <p className="text-base font-bold text-[var(--color-text)] mt-0.5">
//                             {owner.zones.length < 10
//                               ? `0${owner.zones.length}`
//                               : owner.zones.length}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Parking Zones Badges */}
//                     {owner.zones.length > 0 && (
//                       <div className="flex flex-wrap gap-1.5 max-h-[64px] overflow-y-auto no-scrollbar">
//                         {owner.zones.map((zone) => (
//                           <span
//                             key={zone.id}
//                             className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
//                               zone.isActive
//                                 ? "bg-[var(--color-primary)]/[0.04] border-[var(--color-primary)]/15 text-[var(--color-primary)]"
//                                 : "bg-red-500/[0.03] border-red-500/10 text-red-500/80"
//                             }`}
//                           >
//                             {zone.name}
//                           </span>
//                         ))}
//                       </div>
//                     )}

//                     {/* Actions Section */}
//                     <div className="grid grid-cols-3 gap-2.5 pt-1">
//                       <button
//                         onClick={() => handleEdit(owner)}
//                         className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] text-xs font-semibold text-[var(--color-text)] shadow-sm transition-all duration-200 active:scale-95"
//                       >
//                         <Edit size={13} strokeWidth={2} />
//                         Edit
//                       </button>

//                       <button
//                         onClick={() => handleToggleStatus(owner.id)}
//                         className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
//                           owner.isActive
//                             ? "bg-red-500/[0.03] border-red-500/20 text-red-500 hover:bg-red-500/[0.07]"
//                             : "bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/[0.07]"
//                         }`}
//                       >
//                         <Power size={13} strokeWidth={2} />
//                         {owner.isActive ? "Disable" : "Enable"}
//                       </button>

//                       <button
//                         onClick={() => handleDownloadQR(owner.qrCodeUrl)}
//                         className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover,var(--color-primary))] shadow-sm transition-all duration-200 active:scale-[0.97]"
//                       >
//                         <Download size={13} strokeWidth={2.5} />
//                         QR
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
//                 <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
//                   Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
//                   {Math.min(
//                     currentPage * itemsPerPage,
//                     filteredParkingOwners.length,
//                   )}{" "}
//                   of {filteredParkingOwners.length} owners
//                 </p>
//                 <div className="flex items-center gap-1.5">
//                   <button
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage((p) => p - 1)}
//                     className="p-2 rounded-lg hover:bg-[var(--color-surface-soft)] border border-[var(--color-border)] transition-all disabled:opacity-40"
//                   >
//                     <ChevronLeft size={16} />
//                   </button>
//                   {Array.from(
//                     { length: Math.min(totalPages, 5) },
//                     (_, i) => i + 1,
//                   ).map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
//                         currentPage === page
//                           ? "bg-[var(--color-primary)] text-white shadow-md"
//                           : "hover:bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)]"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                   {totalPages > 5 && (
//                     <span className="text-[var(--color-text-muted)]">...</span>
//                   )}
//                   {totalPages > 5 && (
//                     <button
//                       onClick={() => setCurrentPage(totalPages)}
//                       className="w-9 h-9 rounded-lg text-xs font-bold hover:bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)]"
//                     >
//                       {totalPages}
//                     </button>
//                   )}
//                   <button
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage((p) => p + 1)}
//                     className="p-2 rounded-lg hover:bg-[var(--color-surface-soft)] border border-[var(--color-border)] transition-all disabled:opacity-40"
//                   >
//                     <ChevronRight size={16} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Create/Edit Drawer */}
//       <ParkingOwnerFormDrawer
//         isOpen={isDrawerOpen}
//         onClose={() => setIsDrawerOpen(false)}
//         onSubmit={handleSubmit}
//         editingParkingOwner={editingParkingOwner}
//         formData={formData}
//         onFormChange={handleFormChange}
//       />
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  MapPin,
  QrCode,
  Power,
  Building2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  parkingOwnerService,
  ParkingZone,
  ParkingOwner,
} from "@/services/parking-owner.service";
import {
  listParkingZones,
  createParkingZone,
  updateParkingZone,
  deleteParkingZone,
  mapZoneToUi,
} from "@/services/parking-zones.service";

// Zone Card Component
const ZoneCard = ({
  zone,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  zone: ParkingZone;
  index: number;
  onEdit: (zone: ParkingZone) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-5 shadow-sm shadow-black/[0.01] hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/[0.06] border border-[var(--color-primary)]/10 flex items-center justify-center">
          <span className="text-xs font-bold text-[var(--color-primary)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h4 className="font-bold text-[var(--color-text)] tracking-tight text-sm">
          {zone.name}
        </h4>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(zone)}
          className="p-2 rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:scale-95"
          title="Edit Zone"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => onDelete(zone.id)}
          className="p-2 rounded-xl bg-red-500/[0.03] hover:bg-red-500/[0.08] text-red-500/80 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/10 active:scale-95"
          title="Delete Zone"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/40">
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${zone.isActive ? "bg-emerald-500" : "bg-neutral-400 dark:bg-neutral-600"}`}
        />
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {zone.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <button
        onClick={() => onToggleStatus(zone.id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all active:scale-95 ${
          zone.isActive
            ? "bg-red-500/[0.02] border-red-500/20 text-red-500 hover:bg-red-500/[0.06]"
            : "bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/[0.06]"
        }`}
      >
        <Power size={11} strokeWidth={2.5} />
        {zone.isActive ? "Disable" : "Enable"}
      </button>
    </div>
  </motion.div>
);

// Zone Form Drawer
const ZoneFormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  zone,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  zone: ParkingZone | null;
}) => {
  const [name, setName] = useState(zone?.name || "");

  useEffect(() => {
    setName(zone?.name || "");
  }, [zone]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter zone name");
      return;
    }
    onSubmit({ name: name.trim() });
    setName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-40 transition-all duration-300"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[var(--color-bg)] shadow-2xl z-50 border-l border-[var(--color-border)]/60 flex flex-col outline-none"
          >
            <div className="p-6 bg-[var(--color-bg)] border-b border-[var(--color-border)]/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
                  {zone ? "Edit Zone" : "Add New Zone"}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
                  {zone
                    ? "Update zone configurations"
                    : "Create a new parking asset structure"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex-1 bg-[var(--color-surface-soft)]/10 space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] px-0.5">
                  Zone Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., VIP Floor, Section A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-5 bg-[var(--color-bg)] border-t border-[var(--color-border)]/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)]/80 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)] transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover,var(--color-primary))] text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-md shadow-[var(--color-primary)]/10 transition-colors active:scale-[0.98]"
              >
                {zone ? "Save Changes" : "Create Zone"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function MyParkingLotPage() {
  const [loading, setLoading] = useState(true);
  const [parkingOwner, setParkingOwner] = useState<ParkingOwner | null>(null);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [isZoneDrawerOpen, setIsZoneDrawerOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ParkingZone | null>(null);

  useEffect(() => {
    fetchParkingOwner();
  }, []);

  const fetchParkingOwner = async () => {
    try {
      setLoading(true);
      const [owner, zoneRows] = await Promise.all([
        parkingOwnerService.getCurrentParkingOwner(),
        listParkingZones(),
      ]);
      setParkingOwner(owner);
      setZones(zoneRows.map(mapZoneToUi));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load parking lot data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = () => {
    setEditingZone(null);
    setIsZoneDrawerOpen(true);
  };

  const handleEditZone = (zone: ParkingZone) => {
    setEditingZone(zone);
    setIsZoneDrawerOpen(true);
  };

  const handleSaveZone = async (data: { name: string }) => {
    try {
      if (editingZone) {
        const updated = await updateParkingZone(editingZone.id, {
          name: data.name,
          isActive: editingZone.isActive,
          hourlyRate: editingZone.rate,
        });
        setZones((prev) =>
          prev.map((z) => (z.id === editingZone.id ? mapZoneToUi(updated) : z)),
        );
        toast.success("Zone updated");
      } else {
        const created = await createParkingZone({
          name: data.name,
          address: parkingOwner?.parkingAddress,
          hourlyRate: parkingOwner ? 4.5 : undefined,
          availableSpots: 10,
          totalSpots: 10,
          isActive: true,
        });
        setZones((prev) => [...prev, mapZoneToUi(created)]);
        toast.success("Zone added to database");
      }
      setIsZoneDrawerOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save zone");
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    try {
      await deleteParkingZone(zoneId);
      setZones((prev) => prev.filter((z) => z.id !== zoneId));
      toast.success("Zone deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete zone");
    }
  };

  const handleToggleZoneStatus = async (zoneId: string) => {
    try {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;
      const updated = await updateParkingZone(zoneId, {
        name: zone.name,
        isActive: !zone.isActive,
        hourlyRate: zone.rate,
      });
      setZones((prev) => prev.map((z) => (z.id === zoneId ? mapZoneToUi(updated) : z)));
      toast.success("Zone status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update zone status");
    }
  };

  const handleDownloadQR = async () => {
    if (parkingOwner?.qrCodeUrl) {
      window.open(parkingOwner.qrCodeUrl, "_blank");
      toast.success("QR code downloaded");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!parkingOwner) {
    return (
      <div className="min-h-screen p-6 bg-[var(--color-bg)] flex items-center justify-center">
        <div className="max-w-md w-full text-center py-12 px-6 bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-3xl shadow-sm">
          <div className="w-14 h-14 mx-auto bg-neutral-500/[0.06] border border-neutral-500/10 rounded-2xl flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
            <Building2 size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
            No Parking Lot Found
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium max-w-xs mx-auto leading-relaxed">
            Please contact system administrator to allocate and register your
            specific parking perimeter lot space.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 ">
      <div className=" space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">
            My <span className="text-[var(--color-primary)]">Parking Lot</span>
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
            Manage your localized parking zone configurations, assets and
            dynamic scan QR access flows.
          </p>
        </div>

        {/* Info Blocks + QR Segment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parking Lot Identity Block */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-6 shadow-sm shadow-black/[0.01] flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[var(--color-primary)]/[0.06] border border-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                <Building2 size={20} strokeWidth={2} />
              </div>
              <div className="space-y-1.5 overflow-hidden">
                <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight truncate">
                  {parkingOwner.parkingName}
                </h2>
                <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                  <MapPin
                    size={14}
                    className="text-[var(--color-text-muted)] mt-0.5 shrink-0"
                  />
                  <span className="text-xs font-medium leading-relaxed line-clamp-2">
                    {parkingOwner.parkingAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)]/40 flex items-center">
              <span
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                  parkingOwner.isActive
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}
              >
                {parkingOwner.isActive ? "Active Structure" : "Disabled Access"}
              </span>
            </div>
          </div>

          {/* QR  */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-5 shadow-sm shadow-black/[0.01] flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 bg-white rounded-xl border border-[var(--color-border)]/80 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={parkingOwner.qrCodeUrl}
                alt="QR Code Ticket flow"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-3 flex flex-col justify-between h-full">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-primary)]">
                  <QrCode size={16} strokeWidth={2.5} />
                  <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
                    QR Entry System
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] font-medium leading-relaxed">
                  End-users and clients scan this generated asset directly to
                  trigger digital session check-ins.
                </p>
              </div>
              <button
                onClick={handleDownloadQR}
                className="w-full sm:w-auto self-start flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover,var(--color-primary))] text-white text-xs font-semibold rounded-xl shadow-md shadow-[var(--color-primary)]/10 transition-all active:scale-[0.97]"
              >
                <Download size={13} strokeWidth={2.5} /> Download Ticket QR
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Zones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                Configured Perimeters
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                Manage and monitor distinct zones inside this physical location
                block.
              </p>
            </div>
            <button
              onClick={handleAddZone}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] text-[var(--color-text)] text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Plus size={14} strokeWidth={2.5} /> Add Zone
            </button>
          </div>

          {zones.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-12 text-center shadow-sm shadow-black/[0.01]">
              <div className="w-12 h-12 mx-auto bg-[var(--color-surface-soft)] rounded-xl flex items-center justify-center mb-3 text-[var(--color-text-muted)] border border-[var(--color-border)]/40">
                <MapPin size={20} />
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
                No Allocated Perimeters
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">
                Establish your initial operational floor grid layout map.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone, idx) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  index={idx}
                  onEdit={handleEditZone}
                  onDelete={handleDeleteZone}
                  onToggleStatus={handleToggleZoneStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone Form Drawer */}
      <ZoneFormDrawer
        isOpen={isZoneDrawerOpen}
        onClose={() => setIsZoneDrawerOpen(false)}
        onSubmit={handleSaveZone}
        zone={editingZone}
      />
    </div>
  );
}
