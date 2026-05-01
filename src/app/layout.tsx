import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlayerProvider } from "@/context/PlayerContext";
import { MatchProvider } from "@/context/MatchContext";
import { Header } from "@/components/layout/Header";
import { BackgroundEffect } from "@/components/layout/BackgroundEffect";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Football Squad";
const APP_DEFAULT_TITLE = "Football Squad - Team Manager";
const APP_TITLE_TEMPLATE = "%s | Football Squad";
const APP_DESCRIPTION = "Manage your football squad, track player stats, and create balanced teams";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon-32.png"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden`}
      >
        <BackgroundEffect />
        <PlayerProvider>
          <MatchProvider>
            <Header />
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl relative z-10">{children}</main>
            <Toaster theme="dark" position="bottom-center" toastOptions={{ className: 'bg-zinc-900 border-white/10 text-white font-bold text-sm' }} />
          </MatchProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
