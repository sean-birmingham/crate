import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Fraunces } from "next/font/google";
import { LibraryProvider } from "@/components/LibraryProvider";
import PlayerBar from "@/components/PlayerBar";
import Sidebar from "@/components/Sidebar";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { getLibrary, readDb } from "@/lib/db";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const library = await getLibrary();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="grid h-dvh grid-cols-[260px_1fr] grid-rows-[minmax(0,1fr)_88px] bg-paper text-ink antialiased">
        <LibraryProvider
          likedIds={library.likedIds}
          savedAlbumIds={library.savedAlbums.map((a) => a.id)}
        >
          <PlayerProvider>
            <Sidebar
              likedCount={library.likedIds.length}
              savedAlbums={library.savedAlbums}
            />
            <main className="overflow-y-auto px-12 py-10">{children}</main>
            <PlayerBar />
          </PlayerProvider>
        </LibraryProvider>
      </body>
    </html>
  );
}
