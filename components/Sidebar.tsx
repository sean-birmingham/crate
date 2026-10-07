"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Heart, House, Plus, Search, Upload } from "lucide-react";
import { createPlaylistAndOpen } from "@/lib/actions";
import { plural } from "@/lib/format";
import type { AlbumWithArtist, PlaylistSummary } from "@/lib/types";
import PlaylistCover from "./PlaylistCover";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your crate", icon: Archive },
];

type Props = {
  likedCount: number;
  savedAlbums: AlbumWithArtist[];
  playlists: PlaylistSummary[];
};

export default function Sidebar({ likedCount, savedAlbums, playlists }: Props) {
  const pathname = usePathname();
  const itemClass = (href: string) =>
    `flex items-center gap-3 rounded-[10px] p-2 ${pathname === href ? "bg-paper" : "hover:bg-paper/60"}`;

  return (
    <aside className="flex flex-col gap-7 overflow-y-auto bg-sunken px-4 py-7 text-ink">
      <Link href="/" className="flex items-center gap-2.5 px-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-deck">
          <span className="size-2.5 rounded-full bg-accent" />
        </span>
        <span className="font-display text-heading-m">Crate</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-11 items-center gap-3.5 rounded-[10px] px-3.5 text-body-m font-medium ${
                active ? "bg-paper text-ink" : "text-soft hover:text-ink"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={1.75}
                className={active ? "text-accent" : ""}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-2.5 pb-1">
          <h2 className="font-mono text-label uppercase text-faint">
            Your crate
          </h2>
          <form action={createPlaylistAndOpen}>
            <button
              aria-label="New playlist"
              className="text-soft hover:text-ink"
            >
              <Plus size={20} strokeWidth={1.75} />
            </button>
          </form>
        </div>

        <Link href="/liked" className={itemClass("/liked")}>
          <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-accent-soft text-accent">
            <Heart size={20} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="min-w-0">
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
            className={itemClass(`/playlist/${p.id}`)}
          >
            <PlaylistCover covers={p.covers} size={44} />
            <span className="min-w-0">
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
            <span className="min-w-0">
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

      <Link
        href="/upload"
        className="mt-auto flex h-11 items-center gap-3.5 px-3.5 text-body-m font-medium text-soft hover:text-ink"
      >
        <Upload size={22} strokeWidth={1.75} />
        Upload music
      </Link>
    </aside>
  );
}
