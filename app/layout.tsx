import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Fraunces } from "next/font/google";
import PlayerBar from "@/components/PlayerBar";
import Sidebar from "@/components/Sidebar";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Crate",
  description: "A record-shop take on a music player",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="grid h-dvh grid-cols-[260px_1fr] grid-rows-[minmax(0,1fr)_88px] bg-paper text-ink antialiased">
        <PlayerProvider>
          <Sidebar />
          <main className="overflow-y-auto px-12 py-10">{children}</main>
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
