"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Plus, Upload } from "lucide-react";
import { createPlaylistAndOpen } from "@/lib/actions";
import { READ_ONLY } from "@/lib/config";
import { plural } from "@/lib/format";
import type { AlbumWithArtist, PlaylistSummary } from "@/lib/types";
import AppearanceMenu from "./AppearanceMenu";
import Logo from "./Logo";
import { NAV_LINKS } from "./nav-links";
import PlaylistCover from "./PlaylistCover";

type Props = {
  likedCount: number;
  savedAlbums: AlbumWithArtist[];
  playlists: PlaylistSummary[];
};

// On tablets the sidebar is a narrow rail: icons and covers only. Words stay readable by screen readers.
const railHidden = "sr-only lg:not-sr-only";
const rowClass =
  "flex h-11 items-center justify-center gap-3.5 rounded-[10px] px-3.5 text-body-m font-medium lg:justify-start";

export default function Sidebar({ likedCount, savedAlbums, playlists }: Props) {
  const pathname = usePathname();
  const itemClass = (href: string) =>
    `flex items-center justify-center gap-3 rounded-[10px] p-1 lg:justify-start lg:p-2 ${
      pathname === href ? "bg-paper" : "hover:bg-paper/60"
    }`;

  return (
    <aside className="hidden min-h-0 flex-col bg-sunken text-ink md:flex">
      {/* Scrolling part */}
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-3 py-7 lg:px-4">
        <div className="flex justify-center lg:justify-start lg:px-2.5">
          <Logo nameClassName="hidden lg:inline" />
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-current={active ? "page" : undefined}
                className={`${rowClass} ${active ? "bg-paper text-ink" : "text-soft hover:text-ink"}`}
              >
                <Icon
                  size={22}
                  strokeWidth={1.75}
                  className={`shrink-0 ${active ? "text-accent" : ""}`}
                />
                <span className={railHidden}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-center pb-1 lg:justify-between lg:px-2.5">
            <h2
              className={`font-mono text-label uppercase text-faint ${railHidden}`}
            >
              Your crate
            </h2>
            {!READ_ONLY && (
              <form action={createPlaylistAndOpen}>
                <button
                  aria-label="New playlist"
                  title="New playlist"
                  className="text-soft hover:text-ink"
                >
                  <Plus size={20} strokeWidth={1.75} />
                </button>
              </form>
            )}
          </div>

          <Link
            href="/liked"
            title="Liked songs"
            className={itemClass("/liked")}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-accent-soft text-accent">
              <Heart size={20} fill="currentColor" strokeWidth={0} />
            </span>
            <span className={`min-w-0 ${railHidden}`}>
              <span className="block truncate text-body-m font-medium">
                Liked songs
              </span>
              <span className="block text-body-s text-faint">
                Playlist · {plural(likedCount, "song")}
              </span>
            </span>
          </Link>

          {playlists.map((p) => (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              title={p.name}
              className={itemClass(`/playlist/${p.id}`)}
            >
              <PlaylistCover covers={p.covers} size={44} />
              <span className={`min-w-0 ${railHidden}`}>
                <span className="block truncate text-body-m font-medium">
                  {p.name}
                </span>
                <span className="block text-body-s text-faint">
                  Playlist · {plural(p.trackCount, "song")}
                </span>
              </span>
            </Link>
          ))}

          {savedAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              title={album.title}
              className={itemClass(`/album/${album.id}`)}
            >
              <Image
                src={album.cover}
                alt=""
                width={44}
                height={44}
                unoptimized={album.cover.endsWith(".svg")}
                className="size-11 shrink-0 rounded-sm object-cover"
              />
              <span className={`min-w-0 ${railHidden}`}>
                <span className="block truncate text-body-m font-medium">
                  {album.title}
                </span>
                <span className="block truncate text-body-s text-faint">
                  Album · {album.artist.name}
                </span>
              </span>
            </Link>
          ))}
        </section>
      </div>

      {/* Fixed bottom part, outside the scroll area so the Appearance panel isn't cut off */}
      <div className="flex flex-col gap-1 border-t border-line px-3 py-3 lg:px-4">
        {!READ_ONLY && (
          <Link
            href="/upload"
            title="Upload music"
            className={`${rowClass} text-soft hover:text-ink`}
          >
            <Upload size={22} strokeWidth={1.75} className="shrink-0" />
            <span className={railHidden}>Upload music</span>
          </Link>
        )}
        <AppearanceMenu labelClassName={railHidden} />
      </div>
    </aside>
  );
}
