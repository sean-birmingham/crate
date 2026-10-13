"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecent, getRecentOnServer, subscribeRecent } from "@/lib/recent";
import type { AlbumWithArtist } from "@/lib/types";

// The history lives in this browser, so the section appears just after the page loads.
export default function RecentlyPlayed({
  albums,
}: {
  albums: AlbumWithArtist[];
}) {
  const ids = useSyncExternalStore(
    subscribeRecent,
    getRecent,
    getRecentOnServer
  );
  const recent = ids
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is AlbumWithArtist => album !== undefined) // skip albums that no longer exist
    .slice(0, 6);

  if (recent.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-heading-m">Jump back in</h2>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {recent.map((album) => (
          <li key={album.id}>
            <Link
              href={`/album/${album.id}`}
              className="flex items-center gap-3.5 overflow-hidden rounded-[10px] bg-raised pr-4 transition-colors hover:bg-sunken"
            >
              <Image
                src={album.cover}
                alt=""
                width={64}
                height={64}
                unoptimized={album.cover.endsWith(".svg")}
                className="size-16 shrink-0 object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-body-m font-medium">
                  {album.title}
                </span>
                <span className="block truncate text-body-s text-soft">
                  {album.artist.name}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
