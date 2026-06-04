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
  metadataBase: new URL("https://parkssmart.com"),

  title: {
    default: "Parks-Smart | QR Parking Booking & Enforcement",
    template: "%s | Parks-Smart",
  },

  description:
    "Parks-Smart is a QR-first parking management platform for customers, officers, and admins—enabling QR code scan entry, vehicle booking, officer ticketing, payment management, and lot administration in one place.",

  keywords: [
    "QR parking",
    "parking booking",
    "parking enforcement",
    "parking officer app",
    "parking admin dashboard",
    "customer parking experience",
    "parking lot management",
    "ticketing system",
    "parking payments",
    "smart parking",
  ],

  authors: [
    {
      name: "Parks-Smart",
    },
  ],

  creator: "Parks-Smart",
  publisher: "Parks-Smart",

  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },

  openGraph: {
    title: "Parks-Smart | QR Parking Booking & Enforcement",
    description:
      "Scan a QR code, reserve a parking zone, pay securely, and let officers manage enforcement and admins oversee operations with Parks-Smart.",
    url: "https://parkssmart.com",
    siteName: "Parks-Smart",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Parks-Smart QR Parking",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Parks-Smart | QR Parking Booking & Enforcement",
    description:
      "A complete parking platform with QR scan booking for customers, ticketing for officers, and dashboard controls for admins.",
    images: ["/logo.svg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://parkssmart.com",
  },
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
