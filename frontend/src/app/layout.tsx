import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SystemProvider } from "@/contexts/SystemContext";
import { ParkingBookingProvider } from "@/contexts/CustomerParkingContext";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Parks-Smart ",
  description: "Parking Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased">
        <SystemProvider>
          <ParkingBookingProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: {
                    primary: "var(--color-success)",
                    secondary: "white",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "white",
                  },
                },
              }}
            />
            {children}
          </ParkingBookingProvider>
        </SystemProvider>
      </body>
    </html>
  );
}
