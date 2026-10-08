import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import AlbumCard from "@/components/AlbumCard";
import PlaylistCover from "@/components/PlaylistCover";
import { createPlaylistAndOpen } from "@/lib/actions";
import { READ_ONLY } from "@/lib/config";
import { getLibrary } from "@/lib/db";
import { plural } from "@/lib/format";

const grid = "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8";

export default async function LibraryPage() {
  const { likedIds, playlists, savedAlbums } = await getLibrary();

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-display-l">Your crate</h1>
        <p className="text-body-m text-soft">
          {plural(playlists.length, "playlist")} ·{" "}
          {plural(savedAlbums.length, "album")} ·{" "}
          {plural(likedIds.length, "liked song")}
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-m">Playlists</h2>
        <ul className={grid}>
          <li>
            <Tile
              href="/liked"
              title="Liked songs"
              meta={`Playlist · ${plural(likedIds.length, "song")}`}
            >
              <div className="grid aspect-square w-full place-items-center rounded-sm bg-accent-soft text-accent">
                <Heart size={64} fill="currentColor" strokeWidth={0} />
              </div>
            </Tile>
          </li>

          {playlists.map((p) => (
            <li key={p.id}>
              <Tile
                href={`/playlist/${p.id}`}
                title={p.name}
                meta={`Playlist · ${plural(p.trackCount, "song")}`}
              >
                <PlaylistCover covers={p.covers} />
              </Tile>
            </li>
          ))}

          {!READ_ONLY && (
            <li>
              <form action={createPlaylistAndOpen}>
                <button className="group flex w-full flex-col gap-3.5 text-left">
                  <span className="grid aspect-square w-full place-items-center rounded-sm border-2 border-dashed border-line text-faint transition-colors group-hover:border-accent group-hover:text-accent">
                    <Plus size={40} strokeWidth={1.5} />
                  </span>
                  <span className="text-heading-s">New playlist</span>
                </button>
              </form>
            </li>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-m">Albums</h2>
        {savedAlbums.length > 0 ? (
          <ul className={grid}>
            {savedAlbums.map((album) => (
              <li key={album.id}>
                <AlbumCard album={album} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-m text-soft">
            Albums you save show up here. Tap the heart on any album page.
          </p>
        )}
      </section>
    </div>
  );
}

function Tile({
  href,
  title,
  meta,
  children,
}: {
  href: string;
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-3.5">
      {children}
      <div className="min-w-0">
        <p className="truncate text-heading-s group-hover:underline">{title}</p>
        <p className="truncate text-body-s text-soft">{meta}</p>
      </div>
    </Link>
  );
}
