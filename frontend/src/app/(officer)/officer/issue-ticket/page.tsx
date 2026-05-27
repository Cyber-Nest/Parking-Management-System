"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Car, ChevronRight, Printer, TriangleAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { enqueueOfflineRecord } from "@/lib/officer-offline";
import { formatThermalDate, formatThermalTime } from "@/lib/format-datetime";
import {
  OFFICER_VIOLATION_SUB_TYPES,
  OFFICER_VIOLATION_TYPES,
  defaultFineForViolation,
} from "@/lib/officer-violations";
import { fileToDataUrl } from "@/lib/upload-media";
import {
  OfficerTicket,
  TicketPrintPayload,
  officerEnforcementService,
} from "@/services/officer-enforcement.service";

const MIN_PHOTOS = 3;

const initialForm = {
  licensePlate: "",
  provinceState: "Ontario (ON)",
  vehicleMake: "",
  vehicleModel: "",
  vehicleColor: "",
  vehicleType: "Car",
  violationType: "Unpaid Parking",
  violationSubType: "Unpaid Parking",
  fineAmount: 75,
  locationName: "",
  officerNotes: "",
};

const compressDataUrl = (dataUrl: string) =>
  new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });

export default function OfficerIssueTicketPage() {
  const [licensePlate, setLicensePlate] = useState(initialForm.licensePlate);
  const [provinceState, setProvinceState] = useState(initialForm.provinceState);
  const [vehicleMake, setVehicleMake] = useState(initialForm.vehicleMake);
  const [vehicleModel, setVehicleModel] = useState(initialForm.vehicleModel);
  const [vehicleColor, setVehicleColor] = useState(initialForm.vehicleColor);
  const [vehicleType, setVehicleType] = useState(initialForm.vehicleType);
  const [violationType, setViolationType] = useState(initialForm.violationType);
  const [violationSubType, setViolationSubType] = useState(initialForm.violationSubType);
  const [fineAmount, setFineAmount] = useState(initialForm.fineAmount);
  const [locationName, setLocationName] = useState(initialForm.locationName);
  const [officerNotes, setOfficerNotes] = useState(initialForm.officerNotes);
  const [photos, setPhotos] = useState<string[]>([]);
  const [issuedTicket, setIssuedTicket] = useState<OfficerTicket | null>(null);
  const [printPayload, setPrintPayload] = useState<TicketPrintPayload | null>(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryDateTime, setSummaryDateTime] = useState("");
  const vehiclePhotoInputRef = useRef<HTMLInputElement>(null);
  const evidencePhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSummaryDateTime(new Date().toLocaleString());
    const params = new URLSearchParams(window.location.search);
    const plate = params.get("plate");
    if (plate) setLicensePlate(plate);
    const evidencePhotos = window.localStorage.getItem("officerEvidencePhotos");
    if (evidencePhotos) {
      try {
        const parsed = JSON.parse(evidencePhotos);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          setPhotos(parsed.slice(0, MIN_PHOTOS));
          window.localStorage.removeItem("officerEvidencePhotos");
        }
      } catch {
        window.localStorage.removeItem("officerEvidencePhotos");
      }
    }
  }, []);

  const totalAmount = useMemo(() => fineAmount, [fineAmount]);
  const photosReady = photos.length >= MIN_PHOTOS;

  const issueTicket = async () => {
    if (!licensePlate.trim()) {
      toast.error("License plate is required.");
      return;
    }
    if (!photosReady) {
      toast.error(`Add at least ${MIN_PHOTOS} evidence photos before issuing a ticket.`);
      return;
    }
    setIsSubmitting(true);
    const ticketPayload = {
      licensePlate,
      provinceState,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      vehicleType,
      violationType,
      violationSubType,
      fineAmount,
      lateFee: 0,
      locationName,
      violationDateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
      officerNotes,
      photos,
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        await enqueueOfflineRecord({
          type: "ticket",
          title: `Ticket — ${licensePlate}`,
          subtitle: `${violationType} • ${locationName || "Unknown"}`,
          payload: ticketPayload,
        });
        toast.success("Offline — ticket queued. It will sync when online.");
        setIsSubmitting(false);
        return;
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not queue offline ticket"));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const uploadedPhotos = await officerEnforcementService.uploadPhotosForSubmit(
        photos,
        "parksmart/officer/issue-ticket",
      );
      const ticket = await officerEnforcementService.createTicket({
        ...ticketPayload,
        photos: uploadedPhotos,
      });
      const payload = await officerEnforcementService.getTicketPrint(ticket.id);
      setIssuedTicket(ticket);
      setPrintPayload(payload);
      setShowReviewPanel(false);
      setShowIssuedModal(true);
      toast.success("Ticket issued successfully.");
      setTimeout(() => window.print(), 400);
    } catch (error) {
      console.error(error);
      try {
        await enqueueOfflineRecord({
          type: "ticket",
          title: `Ticket — ${licensePlate}`,
          subtitle: `${violationType} • ${locationName || "Unknown"}`,
          payload: ticketPayload,
        });
        toast.success("Could not reach server — ticket saved to offline queue.");
      } catch {
        toast.error(getApiErrorMessage(error, "Failed to issue ticket. Check required fields and photos."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setLicensePlate(initialForm.licensePlate);
    setProvinceState(initialForm.provinceState);
    setVehicleMake(initialForm.vehicleMake);
    setVehicleModel(initialForm.vehicleModel);
    setVehicleColor(initialForm.vehicleColor);
    setVehicleType(initialForm.vehicleType);
    setViolationType(initialForm.violationType);
    setViolationSubType(initialForm.violationSubType);
    setFineAmount(initialForm.fineAmount);
    setLocationName(initialForm.locationName);
    setOfficerNotes(initialForm.officerNotes);
    setPhotos([]);
    setIssuedTicket(null);
    setPrintPayload(null);
    setShowIssuedModal(false);
    toast.success("Form cleared");
  };

  const addPhotoFromInput = async (event: ChangeEvent<HTMLInputElement>, mode: "replace-main" | "append") => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = await fileToDataUrl(file);
      const dataUrl = await compressDataUrl(raw);
      setPhotos((prev) => (mode === "replace-main" ? [dataUrl, ...prev.slice(1)] : [...prev, dataUrl]));
      toast.success(
        mode === "replace-main" ? "Vehicle photo added (uploads when you issue)" : "Evidence photo added (uploads when you issue)",
      );
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not read photo"));
    } finally {
      event.target.value = "";
    }
  };

  const qrUrl = encodeURIComponent(
    `http://localhost:3000/pay/${printPayload?.ticketNumber ?? issuedTicket?.ticket_number ?? "TICKET"}`,
  );

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-ticket,
          #thermal-ticket * {
            visibility: visible !important;
          }
          #thermal-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            background: white;
            color: black;
            font-family: "Courier New", monospace;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .thermal-page {
            width: 80mm;
            padding: 4mm;
            page-break-after: always;
          }
          .thermal-page:last-child {
            page-break-after: auto;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      <div className="space-y-6">
        <input
          ref={vehiclePhotoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => addPhotoFromInput(event, "replace-main")}
        />
        <input
          ref={evidencePhotoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => addPhotoFromInput(event, "append")}
        />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Ticket</h1>
          <p className="text-sm text-slate-500">Fill in details below to create a new parking violation ticket.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <Panel title="Vehicle Information" icon={<Car size={18} />}>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="License Plate" value={licensePlate} onChange={setLicensePlate} required />
                <Select
                  label="Province / State"
                  value={provinceState}
                  onChange={setProvinceState}
                  options={["Ontario (ON)", "Alberta (AB)", "British Columbia (BC)"]}
                />
                <Field label="Vehicle Make" value={vehicleMake} onChange={setVehicleMake} />
                <Field label="Vehicle Model" value={vehicleModel} onChange={setVehicleModel} />
                <Field label="Vehicle Color" value={vehicleColor} onChange={setVehicleColor} />
                <Select label="Vehicle Type" value={vehicleType} onChange={setVehicleType} options={["Car", "SUV", "Truck", "Van"]} />
              </div>
            </Panel>

            <Panel title="Violation Information" icon={<TriangleAlert size={18} />}>
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Violation Type"
                  value={violationType}
                  onChange={(value) => {
                    setViolationType(value);
                    setFineAmount(defaultFineForViolation(value));
                  }}
                  options={[...OFFICER_VIOLATION_TYPES]}
                />
                <Select
                  label="Violation Sub-Type"
                  value={violationSubType}
                  onChange={setViolationSubType}
                  options={[...OFFICER_VIOLATION_SUB_TYPES]}
                />
                <Field label="Fine Amount" type="number" value={String(fineAmount)} onChange={(v) => setFineAmount(Number(v))} />
                <Field label="Location" value={locationName} onChange={setLocationName} />
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Total Amount</p>
                  <p className="text-2xl font-bold text-rose-600">${totalAmount.toFixed(2)} CAD</p>
                </div>
              </div>
              <div className="mt-4">
                <Textarea label="Officer Notes" value={officerNotes} onChange={setOfficerNotes} />
              </div>
            </Panel>

            {showReviewPanel ? (
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Review Ticket</p>
                    <p className="text-xs text-slate-500">Verify details before issuing the ticket.</p>
                  </div>
                  <button onClick={() => setShowReviewPanel(false)} className="text-xs font-semibold text-[#1062ff]">
                    Close
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Summary label="License Plate" value={licensePlate} />
                  <Summary label="Violation" value={`${violationType} — ${violationSubType}`} />
                  <Summary label="Location" value={locationName || "Not set"} />
                  <Summary label="Photos" value={`${photos.length} of ${MIN_PHOTOS}`} />
                  <Summary label="Amount" value={`$${totalAmount.toFixed(2)} CAD`} danger />
                  <Summary label="Date & Time" value={summaryDateTime || "Loading..."} />
                </div>
              </section>
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 font-bold">Ticket Summary</h2>
              <div className="grid gap-4 text-sm md:grid-cols-5">
                <Summary label="License Plate" value={licensePlate || "—"} />
                <Summary label="Violation" value={violationType} />
                <Summary label="Sub-Type" value={violationSubType} />
                <Summary label="Date & Time" value={summaryDateTime || "Loading..."} />
                <Summary label="Total Amount" value={`$${totalAmount.toFixed(2)} CAD`} danger />
              </div>
              {!photosReady ? (
                <p className="mt-3 text-sm font-semibold text-rose-600">
                  Add {MIN_PHOTOS} evidence photos to enable ticket submission.
                </p>
              ) : null}
            </section>

            <div className="grid gap-3 md:grid-cols-2">
              <button onClick={clearForm} className="rounded-md border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600">
                Clear Form
              </button>
              <button
                onClick={() => setShowReviewPanel(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600"
              >
                Review Ticket
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => void issueTicket()}
              disabled={isSubmitting || !photosReady}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1062ff] py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Uploading photos & issuing..." : "Issue Ticket"}
              <Printer size={16} />
            </button>
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-bold">Plate / Vehicle Photo</h2>
              {photos[0] ? (
                <img src={photos[0]} alt="Vehicle evidence" className="h-48 w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-md bg-slate-50 text-sm font-bold text-slate-400">
                  No vehicle photo
                </div>
              )}
              <button
                onClick={() => vehiclePhotoInputRef.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 py-4 text-sm font-bold text-[#1062ff]"
              >
                <Camera size={18} />
                Browse Photo
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold">Evidence Photos</h2>
                <span className={`text-xs font-bold ${photosReady ? "text-emerald-600" : "text-rose-600"}`}>
                  {photos.length} of {MIN_PHOTOS} required
                </span>
              </div>
              <div className="space-y-3">
                {photos.map((photo) => (
                  <div key={photo} className="relative">
                    <img src={photo} alt="Evidence" className="h-28 w-full rounded-md object-cover" />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((p) => p !== photo))}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => evidencePhotoInputRef.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 py-4 text-sm font-bold text-[#1062ff]"
              >
                <Camera size={18} />
                Browse Photo
              </button>
            </section>
          </aside>
        </div>
      </div>

      {showIssuedModal && issuedTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-900">Ticket Issued</p>
                <p className="mt-1 text-sm text-slate-500">Save these details for your records.</p>
              </div>
              <button onClick={() => setShowIssuedModal(false)} className="rounded-md border border-slate-200 p-2">
                <X size={16} />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Ticket ID</dt>
                <dd className="font-mono font-bold text-slate-900">{issuedTicket.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Ticket Number</dt>
                <dd className="font-bold text-slate-900">{issuedTicket.ticket_number}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">License Plate</dt>
                <dd className="font-bold text-slate-900">{issuedTicket.license_plate}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Amount Due</dt>
                <dd className="font-bold text-rose-600">${Number(issuedTicket.amount).toFixed(2)} CAD</dd>
              </div>
            </dl>
            <button
              onClick={() => window.print()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1062ff] py-3 text-sm font-bold text-white"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </section>
        </div>
      ) : null}

      <div id="thermal-ticket" className="fixed -left-[9999px] top-0 w-[80mm] bg-white text-black print:left-0">
        <ThermalTicket payload={printPayload} issuedTicket={issuedTicket} totalAmount={totalAmount} qrUrl={qrUrl} />
      </div>
    </>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1062ff]">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1062ff]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1062ff]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={250}
        rows={4}
        className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1062ff]"
      />
    </label>
  );
}

function Summary({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`font-bold ${danger ? "text-rose-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function ThermalTicket({
  payload,
  issuedTicket,
  totalAmount,
  qrUrl,
}: {
  payload: TicketPrintPayload | null;
  issuedTicket: OfficerTicket | null;
  totalAmount: number;
  qrUrl: string;
}) {
  const ticketNumber = payload?.ticketNumber ?? issuedTicket?.ticket_number ?? "--";
  const issuedAtRaw = payload?.issuedAt ?? issuedTicket?.date_issued ?? null;
  const issuedAt = issuedAtRaw ? new Date(issuedAtRaw) : null;
  const violation = payload?.violationType ?? issuedTicket?.reason ?? "No Parking Time Purchased";

  return (
    <>
      <div className="thermal-page font-mono text-[12px] leading-tight">
        <div className="mb-4 h-12 bg-[#0478c8] px-2 py-1 text-white">
          <div className="text-center text-[18px] font-bold tracking-wide">PARKING CITATION</div>
          {/* <div className="mt-1 flex items-center justify-center gap-2 text-[11px] font-bold leading-none">
            <span className="grid grid-cols-2 gap-[2px]">
              <span className="h-3 w-3 bg-white" />
              <span className="h-3 w-3 bg-white/70" />
              <span className="h-3 w-3 bg-white/70" />
              <span className="h-3 w-3 bg-white" />
            </span>
             <span>
              Parksmart
              <br />
              Services
            </span> 
          </div> */}
        </div>

        <div className="text-[15px]">Warning# {ticketNumber}</div>

        <div className="mt-8 space-y-1">
          <PrintLine label="Issue Date" value={issuedAt ? formatCitationDate(issuedAt) : "--/--/----"} />
          <PrintLine label="Issue Time" value={issuedAt ? formatCitationTime(issuedAt) : "--:-- --"} />
          <PrintLine label="Ambassador" value={payload?.officerName ?? issuedTicket?.officer_name ?? "Officer"} />
        </div>

        <div className="mt-8 space-y-1">
          <PrintLine label="Location" value={payload?.locationName ?? issuedTicket?.location_name ?? "--"} />
          <PrintLine label="Meter #" value={detailText(payload, "meterNumber")} />
          <PrintLine
            label="Chalk Date & Time"
            value={issuedAt ? `${formatCitationDate(issuedAt).slice(0, 6)}${String(issuedAt.getFullYear()).slice(2)} ${formatCitationTime(issuedAt)}` : "--"}
          />
        </div>

        <div className="mt-8">
          <div>Violation: {violationCode(violation)}</div>
          <div>{violation}</div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center text-[22px] font-bold text-[#0478c8]/20">
            Parksmart
            <br />
            Services
          </div>
          <div className="relative text-[20px] italic">
            Fine Amount: ${Number(payload?.totalAmount ?? totalAmount).toFixed(0)}
          </div>
        </div>

        <div className="text-[24px]">Vehicle Information</div>
        <div className="mt-2 space-y-1">
          <PrintLine label="License Plate" value={payload?.licensePlate ?? issuedTicket?.license_plate ?? "--"} />
          <PrintLine label="Make" value={detailText(payload, "vehicleMake")} />
          <PrintLine label="Model" value={detailText(payload, "vehicleModel")} />
          <PrintLine label="Color" value={detailText(payload, "vehicleColor")} />
        </div>

        <div className="mt-8">
          <div>Comments:</div>
          <div className="mt-4 font-bold uppercase">{detailText(payload, "officerNotes") || "PAYMENT REQUIRED"}</div>
        </div>

        <div className="mt-8 flex justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrUrl}`}
            alt="Payment QR code"
            width={140}
            height={140}
            className="border border-black"
          />
        </div>
        <div className="mt-2 text-center text-[11px]">Scan QR code to pay or appeal online.</div>
{/* 
        <div className="mt-8 text-center text-[17px] font-bold leading-tight">
          Please see reverse for
          <br />
          payment & appeal information
        </div> */}
        <div className="mt-4 h-2 bg-black" />
      </div>

     {/*  <div className="thermal-page font-sans text-[12px] leading-tight text-[#0f5575]">
        <p className="font-bold">Payments:</p>
        <p>Online through our secure portal by credit card: https://ahsparkingservices.t2hosted.ca</p>

        <p className="mt-4">Mail a cheque or money order (no cash) to the address below.</p>
        <AddressBlock />

        <p className="mt-4">
          Please be sure to include this citation or the citation number found on the front of this notice with payment.
        </p>
        <p className="mt-3">Cheques and money orders must be made payable to Parksmart Services.</p>
        <p>Payments are also accepted in person at any Parksmart Services Parking Office during business hours.</p>

        <p className="mt-5 font-bold">Appeals:</p>
        <p>Online through our secure portal: https://ahsparkingservices.t2hosted.ca</p>
        <p className="mt-3">
          <span className="font-bold">Email:</span> parkingviolation@ahs.ca
        </p>
        <div className="mt-2 flex gap-3">
          <span className="font-bold">Mail:</span>
          <AddressBlock compact />
        </div>

        <p className="mt-4">All appeals must include the following information:</p>
        <ul className="ml-4 list-disc">
          <li>Full name</li>
          <li>Email address and mailing address</li>
          <li>Copies of any relevant documentation such as parking receipts, disabled permits, etc</li>
          <li>Citation number</li>
          <li>Reason for your appeal</li>
        </ul>

        <p className="mt-4 font-bold">
          Appeals received after sixty (60) days from the issue date on this citation will not be considered.
        </p>
        <p className="mt-8 text-[9px]">104896 (2019-11)</p>
      </div> */}
    </>
  );
}

function PrintLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="break-words">
      {label}: {value || "--"}
    </div>
  );
}

function AddressBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? "" : "mt-2"} text-center`}>
      <div>Parksmart Services</div>
      <div>Parking Services</div>
      <div>Alberta Hospital Edmonton</div>
      <div>PO Box 307</div>
      <div>Edmonton, AB&nbsp; T5J 2J7</div>
    </div>
  );
}

function detailText(payload: TicketPrintPayload | null, key: string): string {
  const value = payload?.details?.[key];
  return value === undefined || value === null ? "" : String(value);
}

function formatCitationDate(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatCitationTime(date: Date): string {
  const hours24 = date.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${minutes} ${hours24 < 12 ? "AM" : "PM"}`;
}

function violationCode(violation?: string | null): string {
  return violation?.toLowerCase().includes("unpaid") || violation?.toLowerCase().includes("payment") ? "247A" : "247";
}

function ThermalTicketLegacy({
  payload,
  issuedTicket,
  totalAmount,
  qrUrl,
}: {
  payload: TicketPrintPayload | null;
  issuedTicket: OfficerTicket | null;
  totalAmount: number;
  qrUrl: string;
}) {
  const ticketNumber = payload?.ticketNumber ?? issuedTicket?.ticket_number ?? "—";
  const ticketId = payload?.ticketId ?? issuedTicket?.id ?? "—";
  const issuedAtRaw = payload?.issuedAt ?? issuedTicket?.date_issued ?? null;
  const issuedAt = issuedAtRaw ? new Date(issuedAtRaw) : null;

  return (
    <>
      <div className="thermal-page text-center font-mono text-[12px] leading-tight">
        <div className="text-[20px] font-bold tracking-widest">PAYMENT RECEIPT</div>
        <div className="mt-3 text-[12px] font-bold">PARKSMART</div>
        <div className="text-[12px] font-bold">ENFORCEMENT PARKING</div>
        <div className="my-4 border-t border-dashed border-black" />
        <div>License Plate Number</div>
        <div className="my-2 text-[32px] font-bold leading-none">
          {payload?.licensePlate ?? issuedTicket?.license_plate ?? "—"}
        </div>
        <div>Violation Date/Time</div>
        <div className="my-2 text-[24px] font-bold">
          {issuedAt ? formatThermalTime(issuedAt) : "—"}
        </div>
        <div className="text-[22px] font-bold">
          {issuedAt ? formatThermalDate(issuedAt) : "—"}
        </div>
        <div className="my-4 border-t border-dashed border-black" />
        <div className="text-left">
          <div>Ticket ID: {ticketId}</div>
          <div>Ticket #: {ticketNumber}</div>
          <div>Officer: {payload?.officerName ?? issuedTicket?.officer_name ?? "Officer"}</div>
          <div>Location: {payload?.locationName ?? issuedTicket?.location_name ?? "—"}</div>
          <div>Violation: {payload?.violationType ?? issuedTicket?.reason ?? "Unpaid Parking"}</div>
          <div>Total Due: ${Number(payload?.totalAmount ?? totalAmount).toFixed(2)} CAD</div>
          <div>Status: {(payload?.status ?? issuedTicket?.status ?? "unpaid").toUpperCase()}</div>
        </div>
        <div className="my-4 border-t border-dashed border-black" />
        <div>Pay or dispute this notice before the due date.</div>
        <div className="mt-2 font-bold">Page 1 of 2</div>
      </div>

      <div className="thermal-page text-center font-mono text-[12px] leading-tight">
        <div className="text-[16px] font-bold">SCAN TO PAY OR APPEAL</div>
        <div className="my-4 flex justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrUrl}`}
            alt="Payment QR code"
            width={180}
            height={180}
            className="border border-black"
          />
        </div>
        <p className="px-2 text-[11px] leading-snug">
          Please scan the bottom QR code for payment and appeal details.
        </p>
        <div className="my-4 border-t border-dashed border-black" />
        <div>Ticket #: {ticketNumber}</div>
        <div>Ticket ID: {ticketId}</div>
        <div className="mt-3 font-bold">REFUNDS WILL NOT BE PROVIDED</div>
        <div className="mt-4 text-[10px]">Dummy QR — replace with live payment URL in production.</div>
        <div className="mt-2 font-bold">Page 2 of 2</div>
      </div>
    </>
  );
}
