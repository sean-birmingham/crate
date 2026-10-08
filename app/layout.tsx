import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans, Fraunces } from "next/font/google";
import AppearanceMenu from "@/components/AppearanceMenu";
import { LibraryProvider } from "@/components/LibraryProvider";
import Logo from "@/components/Logo";
import MobileDock from "@/components/MobileDock";
import PlayerBar from "@/components/PlayerBar";
import Sidebar from "@/components/Sidebar";
import NowPlaying from "@/components/player/NowPlaying";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { READ_ONLY } from "@/lib/config";
import { getLibrary } from "@/lib/db";
import { themeScript } from "@/lib/theme";
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

// Phones: use the full screen (including around the notch) and tint the browser bar to match.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3EBDD" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1614" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const library = await getLibrary();

  return (
    // The theme script changes data-theme before React loads; this tells React that's expected.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Phone: content + dock. Tablet: 80px rail. Desktop: 260px sidebar. */}
      <body className="grid h-dvh grid-rows-[minmax(0,1fr)_auto] bg-paper text-ink antialiased md:grid-cols-[80px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_88px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <LibraryProvider
          likedIds={library.likedIds}
          savedAlbumIds={library.savedAlbums.map((a) => a.id)}
          playlists={library.playlists}
        >
          <PlayerProvider>
            <Sidebar
              likedCount={library.likedIds.length}
              savedAlbums={library.savedAlbums}
              playlists={library.playlists}
            />

            <main className="min-w-0 overflow-y-auto px-4 pb-8 pt-5 sm:px-8 md:px-10 md:py-10 lg:px-12">
              {/* Phone header: the sidebar is hidden, so the logo and Appearance live here */}
              <div className="mb-6 flex items-center justify-between md:hidden">
                <Logo />
                <AppearanceMenu placement="down" labelClassName="sr-only" />
              </div>
              {READ_ONLY && (
                <p className="mb-8 rounded-xl bg-accent-soft px-4 py-3 text-body-s">
                  You&apos;re viewing the online demo. Likes, playlists and
                  uploads are switched off here; run Crate locally for the full
                  app.
                </p>
              )}
              {children}
            </main>

            <PlayerBar />
            <MobileDock />
            <NowPlaying />
          </PlayerProvider>
        </LibraryProvider>
      </body>
    </html>
  );
}
