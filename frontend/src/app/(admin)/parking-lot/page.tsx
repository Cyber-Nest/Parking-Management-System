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
  Hash,
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
import {
  listParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
} from "@/services/parking-lots.service";

interface ParkingLot {
  id: string;
  lot_name: string;
  address?: string | null;
  qr_code_url?: string | null;
}

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
    className="group bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-[var(--color-border)] transition-all duration-300 flex flex-col justify-between min-h-[180px]"
  >
    {/* Top Row: Title & Action Buttons */}
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/[0.06] border border-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[var(--color-primary)] tracking-tight">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h4 className="font-semibold text-[var(--color-text)] tracking-tight text-sm truncate">
          {zone.name}
        </h4>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(zone)}
          className="p-2 rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:scale-95"
          title="Edit Zone"
        >
          <Edit size={14} strokeWidth={2.2} />
        </button>
        <button
          onClick={() => onDelete(zone.id)}
          className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/[0.06] transition-colors active:scale-95"
          title="Delete Zone"
        >
          <Trash2 size={14} strokeWidth={2.2} />
        </button>
      </div>
    </div>

    {/* Middle Row: Info / Stats */}
    <div className="space-y-2 flex-grow mb-4">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <MapPin size={13} className="text-[var(--color-text-muted)] shrink-0" />
        <span className="truncate">
          {(zone as any).address || "No Address"}
        </span>
      </div>

      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/[0.04] px-2.5 py-1 rounded-lg border border-[var(--color-primary)]/10">
        <span>{(zone as any).rate || 0}</span>
        <span className="text-[var(--color-text-muted)] font-normal">
          /hour
        </span>
      </div>
    </div>

    {/* Bottom Row: Status & Toggle Button */}
    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/40 mt-auto">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {zone.isActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-300 ${
              zone.isActive
                ? "bg-emerald-500"
                : "bg-neutral-400 dark:bg-neutral-600"
            }`}
          />
        </span>
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {zone.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <button
        onClick={() => onToggleStatus(zone.id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all active:scale-95 ${
          zone.isActive
            ? "bg-red-50 border-red-200 text-red-500 hover:text-red-500 hover:bg-red-500/[0.04] hover:border-red-500/20"
            : "bg-emerald-500 text-white border-transparent hover:bg-emerald-600 shadow-sm shadow-emerald-500/10"
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
  onSubmit: (data: {
    name: string;
    address?: string;
    hourlyRate?: number;
    isActive: boolean;
    // availableSpots?: number;
    // totalSpots?: number;
  }) => void;
  zone: ParkingZone | null;
}) => {
  const [name, setName] = useState(zone?.name || "");

  const [address, setAddress] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // const [availableSpots, setAvailableSpots] = useState("10");
  // const [totalSpots, setTotalSpots] = useState("10");

  useEffect(() => {
    setName(zone?.name || "");
    setAddress((zone as any)?.address || "");
    setHourlyRate((zone as any)?.rate ? String((zone as any).rate) : "");
    setIsActive(zone?.isActive ?? true);
  }, [zone]);
  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter zone name");
      return;
    }
    onSubmit({
      name: name.trim(),
      address: address.trim() || undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      isActive,
    });
    setName("");
    setAddress("");
    setHourlyRate("");
    setIsActive(true);
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
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] px-0.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123 Parking St, Level 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] px-0.5">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] px-0.5">
                  Zone Status
                </label>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)]/70 rounded-xl">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      id="zone-active"
                      name="zone-status"
                      checked={isActive}
                      onChange={() => setIsActive(true)}
                      className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-primary"
                    />
                    <label
                      htmlFor="zone-active"
                      className="text-sm font-medium text-[var(--color-text)]"
                    >
                      Active
                    </label>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      id="zone-inactive"
                      name="zone-status"
                      checked={!isActive}
                      onChange={() => setIsActive(false)}
                      className="w-4 h-4 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-primary"
                    />
                    <label
                      htmlFor="zone-inactive"
                      className="text-sm font-medium text-[var(--color-text)]"
                    >
                      Inactive
                    </label>
                  </div>
                </div>
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

const LotFormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  lot,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { lot_name: string; address?: string }) => void;
  lot: ParkingLot | null;
}) => {
  const [name, setName] = useState(lot?.lot_name || "");
  const [address, setAddress] = useState(lot?.address || "");

  useEffect(() => {
    setName(lot?.lot_name || "");
    setAddress(lot?.address || "");
  }, [lot]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter lot name");
      return;
    }
    onSubmit({ lot_name: name.trim(), address: address.trim() || undefined });
    setName("");
    setAddress("");
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
                  {lot ? "Edit Parking Lot" : "Add New Parking Lot"}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
                  {lot
                    ? "Update the parking lot details"
                    : "Create a new parking lot for this owner"}
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
                  Lot Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Central Lot, North Tower"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] px-0.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123 Main St, Level 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
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
                {lot ? "Save Changes" : "Create Lot"}
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
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isZoneDrawerOpen, setIsZoneDrawerOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ParkingZone | null>(null);
  const [isLotDrawerOpen, setIsLotDrawerOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);

  useEffect(() => {
    fetchParkingOwner();
  }, []);

  const fetchParkingOwner = async () => {
    try {
      setLoading(true);
      const owner = await parkingOwnerService.getCurrentParkingOwner();
      setParkingOwner(owner);
      try {
        const fetchedLots = await listParkingLots();
        setLots(fetchedLots);
        if (fetchedLots && fetchedLots.length > 0) {
          const firstLot = fetchedLots[0];
          setSelectedLot(firstLot);
          const zoneRows = await listParkingZones({ lotId: firstLot.id });
          setZones(
            zoneRows.length > 0
              ? zoneRows.map(mapZoneToUi)
              : (owner?.zones ?? []),
          );
        } else {
          const zoneRows = await listParkingZones();
          setZones(
            zoneRows.length > 0
              ? zoneRows.map(mapZoneToUi)
              : (owner?.zones ?? []),
          );
        }
      } catch {
        setZones(owner?.zones ?? []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load parking lot data");
    } finally {
      setLoading(false);
    }
  };

  const fetchZonesForLot = async (lot: ParkingLot | null) => {
    if (!lot) return;
    try {
      setLoading(true);
      const zoneRows = await listParkingZones({ lotId: lot.id });
      setZones(zoneRows.length > 0 ? zoneRows.map(mapZoneToUi) : []);
      setSelectedLot(lot);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load zones for selected lot");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLot = () => {
    setEditingLot(null);
    setIsLotDrawerOpen(true);
  };

  const handleAddZone = () => {
    setEditingZone(null);
    setIsZoneDrawerOpen(true);
  };

  const handleEditLot = (lot: ParkingLot) => {
    setEditingLot(lot);
    setIsLotDrawerOpen(true);
  };

  const handleSaveLot = async (data: {
    lot_name: string;
    address?: string;
  }) => {
    try {
      let lotToRefresh: ParkingLot | null = null;
      if (editingLot) {
        const updated = await updateParkingLot(editingLot.id, data);
        setLots((prev) =>
          prev.map((item) => (item.id === editingLot.id ? updated : item)),
        );
        if (selectedLot?.id === editingLot.id) {
          setSelectedLot(updated);
        }
        lotToRefresh = updated;
        toast.success("Parking lot updated");
      } else {
        const created = await createParkingLot(data as any);
        setLots((prev) => [created, ...prev]);
        setSelectedLot(created);
        lotToRefresh = created;
        toast.success("Parking lot created");
      }
      setIsLotDrawerOpen(false);
      setEditingLot(null);
      if (lotToRefresh) {
        await fetchZonesForLot(lotToRefresh);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save parking lot");
    }
  };

  const handleDeleteLot = async (lotId: string) => {
    if (!confirm("Are you sure you want to delete this parking lot?")) return;
    try {
      await deleteParkingLot(lotId);
      setLots((prev) => prev.filter((item) => item.id !== lotId));
      if (selectedLot?.id === lotId) {
        setSelectedLot(null);
        setZones([]);
      }
      toast.success("Parking lot deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete parking lot");
    }
  };

  const handleEditZone = (zone: ParkingZone) => {
    setEditingZone(zone);
    setIsZoneDrawerOpen(true);
  };

  const handleSaveZone = async (data: {
    name: string;
    address?: string;
    hourlyRate?: number;
    isActive: boolean;
  }) => {
    try {
      if (editingZone) {
        try {
          const updated = await updateParkingZone(editingZone.id, {
            name: data.name,
            address: data.address,
            hourlyRate: data.hourlyRate,
            isActive: data.isActive,
            parkingLotId: selectedLot?.id,
          });
          setZones((prev) =>
            prev.map((z) =>
              z.id === editingZone.id ? mapZoneToUi(updated) : z,
            ),
          );
          toast.success("Zone updated");
        } catch {
          const updatedZones = zones.map((z) =>
            z.id === editingZone.id ? { ...z, name: data.name } : z,
          );
          await parkingOwnerService.updateZones(updatedZones);
          setZones(updatedZones);
          toast.success("Zone updated");
        }
      } else {
        try {
          const created = await createParkingZone({
            name: data.name,
            parkingLotId: selectedLot?.id,

            address: data.address,
            hourlyRate: data.hourlyRate,

            isActive: data.isActive,

            // availableSpots: 10,
            // totalSpots: 10,
          });
          setZones((prev) => [...prev, mapZoneToUi(created)]);
          toast.success("Zone added to database");
        } catch {
          const newZone: ParkingZone = {
            id: `ZONE-${Date.now()}`,
            name: data.name,
            isActive: true,
          };
          const updatedZones = [...zones, newZone];
          await parkingOwnerService.updateZones(updatedZones);
          setZones(updatedZones);
          toast.success("Zone added");
        }
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
      try {
        await deleteParkingZone(zoneId);
        setZones((prev) => prev.filter((z) => z.id !== zoneId));
      } catch {
        const updatedZones = zones.filter((z) => z.id !== zoneId);
        await parkingOwnerService.updateZones(updatedZones);
        setZones(updatedZones);
      }
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
      try {
        const updated = await updateParkingZone(zoneId, {
          name: zone.name,
          isActive: !zone.isActive,
          hourlyRate: zone.rate,
          parkingLotId: selectedLot?.id,
        });
        setZones((prev) =>
          prev.map((z) => (z.id === zoneId ? mapZoneToUi(updated) : z)),
        );
      } catch {
        const updatedZones = zones.map((z) =>
          z.id === zoneId ? { ...z, isActive: !z.isActive } : z,
        );
        await parkingOwnerService.updateZones(updatedZones);
        setZones(updatedZones);
      }
      toast.success("Zone status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update zone status");
    }
  };

  const handleDownloadQR = async () => {
    const qrUrl = selectedLot
      ? selectedLot.qr_code_url
      : parkingOwner?.qrCodeUrl;
    if (qrUrl) {
      window.open(qrUrl, "_blank");
      toast.success("QR code downloaded");
    } else if (selectedLot) {
      toast.error("Selected lot has no QR code to download");
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

        {/* Parking Lot Selection */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-3xl p-5 shadow-sm shadow-black/[0.01]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)]">
                Parking Lots
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Select a parking lot to manage its zones and QR flow.
              </p>
            </div>
            <button
              onClick={handleAddLot}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover,var(--color-primary))] transition-all active:scale-[0.98]"
            >
              <Plus size={14} strokeWidth={2.5} /> Add Parking Lot
            </button>
          </div>

          {lots.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-[var(--color-border)]/40 bg-[var(--color-surface-soft)] p-6 text-center">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                No parking lots created yet. Add a lot to start organizing
                zones.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  onClick={() => fetchZonesForLot(lot)}
                  className={`cursor-pointer rounded-3xl border p-4 transition-all ${
                    selectedLot?.id === lot.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)]/60 bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text)] truncate">
                        {lot.lot_name}
                      </p>

                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                        {lot.address || "No address provided"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEditLot(lot);
                        }}
                        className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] transition-all"
                        title="Edit lot"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteLot(lot.id);
                        }}
                        className="p-2 rounded-xl bg-red-500/[0.08] hover:bg-red-500/[0.12] text-red-500 transition-all"
                        title="Delete lot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  {selectedLot?.lot_name || parkingOwner.parkingName}
                </h2>
                <div className="space-y-1.5">
                  {/* ID Row with Hash Icon */}
                  {selectedLot?.id && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Hash
                        size={14}
                        className="text-[var(--color-text-muted)] shrink-0"
                      />
                      <span className="text-xs font-mono font-medium tracking-tight truncate">
                        {selectedLot.id}
                      </span>
                    </div>
                  )}

                  {/* Location Row with MapPin Icon */}
                  <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                    <MapPin
                      size={14}
                      className="text-[var(--color-text-muted)] mt-0.5 shrink-0"
                    />
                    <span className="text-xs font-medium leading-relaxed line-clamp-2">
                      {selectedLot?.address || parkingOwner.parkingAddress}
                    </span>
                  </div>
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
              {selectedLot?.qr_code_url ? (
                <img
                  src={selectedLot.qr_code_url}
                  alt="Selected lot QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-[10px] font-semibold tracking-wide text-center px-2">
                  {selectedLot
                    ? "Selected lot has no QR yet"
                    : "No QR available"}
                </div>
              )}
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
      <LotFormDrawer
        isOpen={isLotDrawerOpen}
        onClose={() => setIsLotDrawerOpen(false)}
        onSubmit={handleSaveLot}
        lot={editingLot}
      />
    </div>
  );
}
