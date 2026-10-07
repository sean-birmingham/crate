import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Heart, Play } from "lucide-react";
import TrackRow from "@/components/TrackRow";
import { getAlbum } from "@/lib/db";
import { formatTime, totalDuration } from "@/lib/format";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const artistName = album.artist.name;
  const sides = Object.groupBy(album.tracks, (t) => t.side[0]);

  const songCount = album.tracks.length;
  const minutes = Math.round(totalDuration(album.tracks) / 60);

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-body-m font-medium text-soft hover:text-ink"
      >
        <ChevronLeft size={20} /> Back to Home
      </Link>

      <header className="flex items-end gap-12">
        <div className="relative h-72.5 w-112.5 shrink-0">
          <Image
            src="/vinyl.svg"
            alt=""
            width={276}
            height={276}
            unoptimized
            className="absolute left-43.5 top-1.75"
          />
          <Image
            src={album.cover}
            alt={`${album.title} cover`}
            width={290}
            height={290}
            unoptimized={album.cover.endsWith(".svg")}
            className="relative size-72.5 rounded-sm object-cover shadow-[0_12px_26px_-4px_rgb(30_25_21/0.24)]"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <p className="font-mono text-label uppercase text-faint">
            LP · {album.year}
          </p>
          <h1 className="font-display text-display-xl">{album.title}</h1>
          <p className="text-body-m">
            <span className="font-medium">{artistName}</span>
            <span className="text-soft">
              {" "}
              · {songCount} {songCount === 1 ? "song" : "songs"}, {minutes} min
            </span>
          </p>
          <div className="mt-2 flex items-center gap-4">
            <button
              aria-label="Play"
              className="grid size-14 place-items-center rounded-full bg-accent text-on-deck"
            >
              <Play size={24} fill="currentColor" className="ml-0.5" />
            </button>
            <button
              aria-label="Like album"
              className="text-soft hover:text-accent"
            >
              <Heart size={26} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2">
        {Object.entries(sides).map(([side, tracks]) => {
          const sideTracks = tracks!;
          return (
            <div key={side}>
              <div className="flex items-center gap-4 px-4 py-2">
                <h2 className="font-mono text-label uppercase">Side {side}</h2>
                <div className="h-px flex-1 bg-line" />
                <span className="font-mono text-body-s text-faint">
                  {formatTime(totalDuration(sideTracks))}
                </span>
              </div>
              <ol>
                {sideTracks.map((t) => (
                  <TrackRow key={t.id} track={t} artist={album.artist} />
                ))}
              </ol>
            </div>
          );
        })}
      </section>
    </div>
  );
}
