"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

export interface ParkingDetails {
  zoneId: string;
  parkingName: string;
  address: string;
  image: string;
  hourlyRate: number;
  availableSpots: number;
  totalSpots: number;
  spotId: string;
}

export interface VehicleDetails {
  email: string;
  vehicleModel: string;
  plateNumber: string;
  carColor: string;
}

export interface DurationDetails {
  label: string;
  value: string;
  price: number;
  minutes: number;
}

export interface BookingSummary {
  subtotal: number;
  serviceFee: number;
  total: number;
  startTime: string;
  endTime: string;
  duration: string;
  transactionId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  bookingId?: string;
}

export interface ExtensionDetails {
  bookingId: string;
  bookingReference?: string;
  parkingName: string;
  zoneName?: string;
  durationLabel: string;
  durationMinutes: number;
  amount: number;
}

interface ParkingBookingContextType {
  parkingDetails: ParkingDetails | null;
  vehicleDetails: VehicleDetails | null;
  selectedDuration: DurationDetails | null;
  bookingSummary: BookingSummary | null;
  extensionDetails: ExtensionDetails | null;

  setParkingDetails: (data: ParkingDetails | null) => void;
  setVehicleDetails: (data: VehicleDetails | null) => void;
  setSelectedDuration: (data: DurationDetails | null) => void;
  setBookingSummary: (data: BookingSummary | null) => void;
  setExtensionDetails: (data: ExtensionDetails | null) => void;

  clearBooking: () => void;
}

const ParkingBookingContext =
  createContext<ParkingBookingContextType | null>(null);

export const ParkingBookingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [parkingDetails, setParkingDetails] =
    useState<ParkingDetails | null>(null);

  const [vehicleDetails, setVehicleDetails] =
    useState<VehicleDetails | null>(null);

  const [selectedDuration, setSelectedDuration] =
    useState<DurationDetails | null>(null);

  const [bookingSummary, setBookingSummary] =
    useState<BookingSummary | null>(null);

  const [extensionDetails, setExtensionDetails] =
    useState<ExtensionDetails | null>(null);

  const clearBooking = () => {
    setParkingDetails(null);
    setVehicleDetails(null);
    setSelectedDuration(null);
    setBookingSummary(null);
    setExtensionDetails(null);
  };

  const value = useMemo(
    () => ({
      parkingDetails,
      vehicleDetails,
      selectedDuration,
      bookingSummary,
      extensionDetails,

      setParkingDetails,
      setVehicleDetails,
      setSelectedDuration,
      setBookingSummary,
      setExtensionDetails,

      clearBooking,
    }),
    [
      parkingDetails,
      vehicleDetails,
      selectedDuration,
      bookingSummary,
      extensionDetails,
    ]
  );

  return (
    <ParkingBookingContext.Provider value={value}>
      {children}
    </ParkingBookingContext.Provider>
  );
};

export const useParkingBooking = () => {
  const context = useContext(ParkingBookingContext);

  if (!context) {
    throw new Error(
      "useParkingBooking must be used within ParkingBookingProvider"
    );
  }

  return context;
};
