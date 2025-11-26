import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlayerProvider } from "@/context/PlayerContext";
import { MatchProvider } from "@/context/MatchContext";
import { Header } from "@/components/layout/Header";
import { BackgroundEffect } from "@/components/layout/BackgroundEffect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Football Squad - Team Manager",
  description: "Manage your football squad, track player stats, and create balanced teams",
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
          </MatchProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
