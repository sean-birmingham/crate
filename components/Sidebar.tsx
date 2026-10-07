"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, Search, Archive, Upload, Heart } from "lucide-react";
import { plural } from "@/lib/format";
import { AlbumWithArtist } from "@/lib/types";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your crate", icon: Archive },
];

export default function Sidebar({
  likedCount,
  savedAlbums,
}: {
  likedCount: number;
  savedAlbums: AlbumWithArtist[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-7 overflow-y-auto bg-sunken px-4 py-7">
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
        <h2 className="px-2.5 pb-1 font-mono text-label uppercase text-faint">
          Your crate
        </h2>
        <Link
          href="/liked"
          className={`flex items-center gap-3 rounded-[10px] p-2 ${pathname === "/liked" ? "bg-paper" : "hover:bg-paper/60"}`}
        >
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

        {savedAlbums.map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className={`flex items-center gap-3 rounded-[10px] p-2 ${
              pathname === `/album/${album.id}`
                ? "bg-paper"
                : "hover:bg-paper/60"
            }`}
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
