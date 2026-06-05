"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Grid3x3,
  Image as ImageIcon,
  List,
  MapPin,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-error";
import { fileToDataUrl } from "@/lib/upload-media";
import {
  EvidencePhoto,
  officerEnforcementService,
} from "@/services/officer-enforcement.service";

type EvidenceView = "all" | "ticket" | "type";
type EvidenceKind = "photo" | "video" | "document";

const PAGE_SIZE = 10;

function inferKind(photo: EvidencePhoto): EvidenceKind {
  const url = photo.photo_url.toLowerCase();
  if (url.includes(".mp4") || url.includes("video")) return "video";
  if (
    url.includes(".pdf") ||
    (photo.source === "standalone" && !url.startsWith("data:image"))
  )
    return "document";
  return "photo";
}

function violationBadge(reason: string) {
  const lower = reason.toLowerCase();
  if (lower.includes("no parking") || lower.includes("fire"))
    return "bg-rose-50 text-rose-700";
  if (lower.includes("expired") || lower.includes("meter"))
    return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

export default function OfficerEvidencePage() {
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<EvidenceView>("all");
  const [selected, setSelected] = useState<EvidencePhoto | null>(null);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const uploadRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPlate, setAddPlate] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addPhotos, setAddPhotos] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<EvidencePhoto | null>(null);
  const [editing, setEditing] = useState<EvidencePhoto | null>(null);
  const [editPlate, setEditPlate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const items = await officerEnforcementService.getEvidence(200);
      setPhotos(items);
      setSelected((current) => {
        if (!current) return items[0] ?? null;
        return items.find((p) => p.id === current.id) ?? items[0] ?? null;
      });
    } catch {
      toast.error("Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("capture") === "true") {
      // open the hidden file input to capture photo
      uploadRef.current?.click();
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("capture");
        router.replace(url.pathname + url.search);
      } catch {
        /* ignore */
      }
    }
  }, [searchParams, router]);

  const stats = useMemo(() => {
    const photoCount = photos.filter((p) => inferKind(p) === "photo").length;
    const videoCount = photos.filter((p) => inferKind(p) === "video").length;
    const docCount = photos.filter((p) => inferKind(p) === "document").length;
    const linked = photos.filter((p) => p.ticket_id).length;
    return { photoCount, videoCount, docCount, linked, total: photos.length };
  }, [photos]);

  const filtered = useMemo(() => {
    let list = [...photos];
    if (view === "ticket") list = list.filter((p) => p.ticket_id);
    if (view === "type") list = list.filter((p) => inferKind(p) === "photo");
    if (typeFilter !== "all")
      list = list.filter((p) => inferKind(p) === typeFilter);
    if (ticketFilter === "linked") list = list.filter((p) => p.ticket_id);
    if (ticketFilter === "standalone") list = list.filter((p) => !p.ticket_id);
    if (statusFilter === "synced") list = list;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((p) =>
        [
          p.ticket_number,
          p.license_plate,
          p.reason,
          p.location_name,
          p.officer_name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
    );
  }, [photos, view, typeFilter, ticketFilter, statusFilter, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearchText("");
    setTypeFilter("all");
    setTicketFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const handleAddPhotoPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setAddPhotos((prev) => [...prev, dataUrl]);
      setShowAddModal(true);
    } catch {
      setAddError("Could not read the selected photo.");
    } finally {
      event.target.value = "";
    }
  };

  const submitAddEvidence = async () => {
    if (!addPlate.trim()) {
      setAddError("License plate is required.");
      return;
    }
    if (!addPhotos.length) {
      setAddError("Add at least one photo before submitting.");
      return;
    }
    setAddSaving(true);
    setAddError(null);
    try {
      const folder = `parksmart/officer/evidence/${addPlate.trim() || "unassigned"}`;
      const urls = await officerEnforcementService.uploadPhotosForSubmit(
        addPhotos,
        folder,
      );
      await officerEnforcementService.captureEvidence({
        licensePlate: addPlate.trim(),
        locationName: addLocation.trim() || undefined,
        notes: addNotes.trim() || undefined,
        photos: urls,
      });
      toast.success("Evidence saved");
      setShowAddModal(false);
      setAddPlate("");
      setAddLocation("");
      setAddNotes("");
      setAddPhotos([]);
      await reload();
    } catch (error) {
      setAddError(getApiErrorMessage(error, "Failed to save evidence."));
    } finally {
      setAddSaving(false);
    }
  };

  const openEditEvidence = (item: EvidencePhoto) => {
    setEditing(item);
    setEditPlate(item.license_plate);
    setEditLocation(item.location_name ?? "");
    setEditReason(item.reason);
    setEditNotes(item.notes ?? "");
    setOpenMenuId(null);
  };

  const submitEditEvidence = async () => {
    if (!editing) return;
    if (!editPlate.trim()) {
      toast.error("License plate is required.");
      return;
    }
    setEditSaving(true);
    try {
      const updated = await officerEnforcementService.updateEvidence(
        editing.id,
        {
          licensePlate: editPlate.trim(),
          locationName: editLocation.trim(),
          reason: editReason.trim(),
          notes: editNotes.trim(),
        },
      );
      setPhotos((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelected((current) =>
        current?.id === updated.id ? updated : current,
      );
      setViewing((current) => (current?.id === updated.id ? updated : current));
      setEditing(null);
      toast.success("Evidence updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update evidence."));
    } finally {
      setEditSaving(false);
    }
  };

  const deleteEvidence = async (item: EvidencePhoto) => {
    setOpenMenuId(null);
    const ok = window.confirm("Delete this evidence? This cannot be undone.");
    if (!ok) return;
    try {
      await officerEnforcementService.deleteEvidence(item.id);
      setPhotos((items) => items.filter((photo) => photo.id !== item.id));
      setSelected((current) => (current?.id === item.id ? null : current));
      setViewing((current) => (current?.id === item.id ? null : current));
      toast.success("Evidence deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete evidence."));
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleAddPhotoPick(e)}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence</h1>
          <p className="text-sm text-slate-500">
            View and manage evidence captured during enforcement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#1062ff]"
          >
            <RefreshCw size={16} />
            Sync
          </button>
          <button
            type="button"
            onClick={() => {
              setAddError(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1062ff] px-4 py-2 text-sm font-bold text-white"
          >
            <Upload size={16} />
            Add Evidence
          </button>
          <Link
            href="/officer/scan"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            <Camera size={16} />
            Capture New
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "All Evidence" },
            { id: "ticket", label: "By Ticket" },
            { id: "type", label: "By Type" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setView(tab.id);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${view === tab.id ? "bg-[#1062ff] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Ticket #, Plate #, Location..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="photo">Photos</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Tickets</option>
            <option value="linked">Linked to Ticket</option>
            <option value="standalone">Standalone</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="synced">Synced</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border px-4 py-2 text-sm font-bold text-slate-600"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ImageIcon}
          color="text-blue-600"
          bg="bg-blue-50"
          label="Photos"
          value={stats.photoCount}
        />
        <StatCard
          icon={Video}
          color="text-purple-600"
          bg="bg-purple-50"
          label="Videos"
          value={stats.videoCount}
        />
        <StatCard
          icon={FileText}
          color="text-emerald-600"
          bg="bg-emerald-50"
          label="Documents"
          value={stats.docCount}
        />
        <StatCard
          icon={FileText}
          color="text-orange-600"
          bg="bg-orange-50"
          label="Linked Tickets"
          value={stats.linked}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold">
              Evidence List ({filtered.length})
            </p>
            <div className="flex items-center gap-2">
              <select className="rounded-lg border px-2 py-1.5 text-xs font-semibold">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
              <button
                type="button"
                onClick={() => setLayout("list")}
                className={`rounded p-1.5 ${layout === "list" ? "bg-slate-100" : ""}`}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setLayout("grid")}
                className={`rounded p-1.5 ${layout === "grid" ? "bg-slate-100" : ""}`}
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-slate-500">
              Loading evidence...
            </p>
          ) : paginated.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-500">
              No evidence matched your filters.
            </p>
          ) : layout === "grid" ? (
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {paginated.map((item) => (
                <EvidenceGridCard
                  key={item.id}
                  item={item}
                  active={selected?.id === item.id}
                  menuOpen={openMenuId === item.id}
                  onMenuToggle={() =>
                    setOpenMenuId((id) => (id === item.id ? null : item.id))
                  }
                  onSelect={() => setSelected(item)}
                  onView={() => {
                    setViewing(item);
                    setOpenMenuId(null);
                  }}
                  onEdit={() => openEditEvidence(item)}
                  onDelete={() => void deleteEvidence(item)}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginated.map((item) => (
                <EvidenceListRow
                  key={item.id}
                  item={item}
                  active={selected?.id === item.id}
                  menuOpen={openMenuId === item.id}
                  onMenuToggle={() =>
                    setOpenMenuId((id) => (id === item.id ? null : item.id))
                  }
                  onSelect={() => setSelected(item)}
                  onView={() => {
                    setViewing(item);
                    setOpenMenuId(null);
                  }}
                  onEdit={() => openEditEvidence(item)}
                  onDelete={() => void deleteEvidence(item)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm">
            <p className="text-slate-500">
              {(page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Evidence Details</h2>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
          {selected ? (
            <EvidenceDetail item={selected} />
          ) : (
            <p className="text-sm text-slate-500">
              Select evidence from the list to view details.
            </p>
          )}
        </aside>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Evidence</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            {addError ? (
              <p
                className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {addError}
              </p>
            ) : null}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500">
                License Plate *
                <input
                  value={addPlate}
                  onChange={(e) => setAddPlate(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold text-slate-500">
                Location
                <input
                  value={addLocation}
                  onChange={(e) => setAddLocation(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold text-slate-500">
                Notes
                <textarea
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Photos (upload on submit)
                </p>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="mt-2 w-full rounded-md border border-dashed border-slate-300 py-3 text-sm font-bold text-[#1062ff]"
                >
                  Browse Photo
                </button>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {addPhotos.map((src) => (
                    <div key={src.slice(0, 32)} className="relative">
                      <img
                        src={src}
                        alt=""
                        className="h-20 w-full rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAddPhotos((prev) => prev.filter((p) => p !== src))
                        }
                        className="absolute right-1 top-1 rounded bg-white px-1 text-xs font-bold"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-md border px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitAddEvidence()}
                disabled={addSaving}
                className="rounded-md bg-[#1062ff] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {addSaving ? "Uploading & saving..." : "Submit Evidence"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {viewing ? (
        <EvidenceModal
          title="Evidence Details"
          onClose={() => setViewing(null)}
        >
          <EvidenceDetail item={viewing} showActions={false} />
        </EvidenceModal>
      ) : null}

      {editing ? (
        <EvidenceModal title="Edit Evidence" onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500">
              License Plate *
              <input
                value={editPlate}
                onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-slate-500">
              Location
              <input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-slate-500">
              Violation / Type
              <input
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-slate-500">
              Notes
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md border px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitEditEvidence()}
                disabled={editSaving}
                className="rounded-md bg-[#1062ff] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </EvidenceModal>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  bg,
  label,
  value,
}: {
  icon: typeof ImageIcon;
  color: string;
  bg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
      >
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function EvidenceListRow({
  item,
  active,
  menuOpen,
  onSelect,
  onMenuToggle,
  onView,
  onEdit,
  onDelete,
}: {
  item: EvidencePhoto;
  active: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const kind = inferKind(item);
  return (
    <div
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition hover:bg-slate-50 ${active ? "bg-blue-50/50" : ""}`}
    >
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {kind === "photo" ? (
          <img
            src={item.photo_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {kind === "video" ? <Video size={20} /> : <FileText size={20} />}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">
          {item.ticket_number
            ? `Ticket: ${item.ticket_number}`
            : "Standalone Evidence"}
        </p>
        <p className="text-xs text-slate-500">
          Plate: {item.license_plate} •{" "}
          {item.location_name ?? "Unknown location"}
        </p>
        <p className="text-xs text-slate-400">
          {kind.toUpperCase()} • {new Date(item.uploaded_at).toLocaleString()}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${violationBadge(item.reason)}`}
      >
        {item.reason}
      </span>
      <ActionMenu
        open={menuOpen}
        onToggle={onMenuToggle}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

function EvidenceGridCard({
  item,
  active,
  menuOpen,
  onSelect,
  onMenuToggle,
  onView,
  onEdit,
  onDelete,
}: {
  item: EvidencePhoto;
  active: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border text-left ${active ? "border-[#1062ff] ring-2 ring-[#1062ff]/30" : "border-slate-200"}`}
    >
      <img
        src={item.photo_url}
        alt=""
        className="h-32 w-full rounded-t-lg object-cover"
      />
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {item.ticket_number ?? item.license_plate}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(item.uploaded_at).toLocaleDateString()}
          </p>
        </div>
        <ActionMenu
          open={menuOpen}
          onToggle={onMenuToggle}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function ActionMenu({
  open,
  onToggle,
  onView,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const run = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(event) => run(event, onToggle)}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Evidence actions"
      >
        <MoreVertical size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
          <button
            type="button"
            onClick={(event) => run(event, onView)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
          >
            <Eye size={14} />
            View
          </button>
          <button
            type="button"
            onClick={(event) => run(event, onEdit)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={(event) => run(event, onDelete)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EvidenceDetail({
  item,
  showActions = true,
}: {
  item: EvidencePhoto;
  showActions?: boolean;
}) {
  const kind = inferKind(item);
  return (
    <div className="space-y-4 text-sm">
      <div className="relative overflow-hidden rounded-lg">
        <img src={item.photo_url} alt="" className="h-48 w-full object-cover" />
      </div>
      <DetailRow label="Ticket Number" value={item.ticket_number ?? "—"} />
      <DetailRow label="Plate Number" value={item.license_plate} />
      <DetailRow label="Violation Type" value={item.reason} highlight />
      <DetailRow label="Location" value={item.location_name ?? "Unknown"} />
      <DetailRow
        label="Captured"
        value={new Date(item.uploaded_at).toLocaleString()}
      />
      <DetailRow
        label="Captured By"
        value={item.officer_name ?? "Officer John"}
      />
      <DetailRow label="File Type" value={kind.toUpperCase()} />
      {item.notes ? <DetailRow label="Notes" value={item.notes} /> : null}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <MapPin size={14} className="text-[#1062ff]" />
        43.6532, -79.3832
      </div>
      <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Synced
      </span>
      {showActions ? (
        <div className="grid gap-2 pt-2">
          <a
            href={item.photo_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#1062ff] py-2.5 text-center text-xs font-bold text-white"
          >
            View Full Screen
          </a>
          <a
            href={item.photo_url}
            download
            className="inline-flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-bold"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      ) : null}
    </div>
  );
}

function EvidenceModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="text-slate-500">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p
        className={`font-semibold ${highlight ? "text-rose-600" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
