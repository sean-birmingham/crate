import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PlayButton from "@/components/PlayButton";
import TrackList from "@/components/TrackList";
import { getAlbum } from "@/lib/db";
import { formatTime, plural, totalDuration } from "@/lib/format";
import LikeButton from "@/components/LikeButton";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const minutes = Math.round(totalDuration(album.tracks) / 60);
  const sides = Object.entries(Object.groupBy(album.tracks, (t) => t.side[0]));

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/"
        className="flex items-center gap-1.5 self-start text-body-m font-medium text-soft hover:text-ink"
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
            <Link
              href={`/artist/${album.artist.id}`}
              className="font-medium hover:underline"
            >
              {album.artist.name}
            </Link>
            <span className="text-soft">
              {" "}
              · {plural(album.tracks.length, "song")}, {minutes} min
            </span>
          </p>
          <div className="mt-2 flex items-center gap-4">
            <PlayButton queue={album.tracks} />
            <LikeButton
              kind="album"
              id={album.id}
              title={album.title}
              size={26}
              idleClass="text-soft hover:text-accent"
            />
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2">
        {sides.map(([side, tracks = []]) => (
          <div key={side}>
            <div className="flex items-center gap-4 px-4 py-2">
              <h2 className="font-mono text-label uppercase">Side {side}</h2>
              <div className="h-px flex-1 bg-line" />
              <span className="font-mono text-body-s text-faint">
                {formatTime(totalDuration(tracks))}
              </span>
            </div>
            <TrackList tracks={tracks} queue={album.tracks} />
          </div>
        ))}
      </section>
    </div>
  );
}
