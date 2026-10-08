import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import PlayButton from "@/components/PlayButton";
import TrackList from "@/components/TrackList";
import { READ_ONLY } from "@/lib/config";
import { getAlbum } from "@/lib/db";
import { formatTime, plural, totalDuration } from "@/lib/format";

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
    <div className="flex flex-col gap-8 md:gap-10">
      <Link
        href="/"
        className="flex items-center gap-1.5 self-start text-body-m font-medium text-soft hover:text-ink"
      >
        <ChevronLeft size={20} /> Back to Home
      </Link>

      <header className="flex flex-col items-start gap-6 md:flex-row md:items-end md:gap-12">
        {/* Sleeve with the record sliding out, scaled to the space available */}
        <div className="relative aspect-450/290 w-full max-w-112.5 shrink-0">
          <Image
            src="/vinyl.svg"
            alt=""
            width={276}
            height={276}
            loading="eager"
            unoptimized
            className="absolute left-[38.7%] top-[2.4%] h-auto w-[61.3%] dark:drop-shadow-[0_0_1px_rgb(243_235_221/0.45)]"
          />
          <Image
            src={album.cover}
            alt={`${album.title} cover`}
            width={290}
            height={290}
            loading="eager"
            unoptimized={album.cover.endsWith(".svg")}
            className="relative aspect-square h-auto w-[64.4%] rounded-sm object-cover shadow-[0_12px_26px_-4px_rgb(30_25_21/0.24)]"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <p className="font-mono text-label uppercase text-faint">
            LP · {album.year}
          </p>
          <h1 className="wrap-break-word font-display text-display-l md:text-display-xl">
            {album.title}
          </h1>
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
            <PlayButton queue={album.tracks} source={album.title} />
            {!READ_ONLY && (
              <LikeButton
                kind="album"
                id={album.id}
                title={album.title}
                size={26}
                idleClass="text-soft hover:text-accent"
              />
            )}
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2">
        {sides.map(([side, tracks = []]) => (
          <div key={side}>
            <div className="flex items-center gap-4 px-2 py-2 sm:px-4">
              <h2 className="font-mono text-label uppercase">Side {side}</h2>
              <div className="h-px flex-1 bg-line" />
              <span className="font-mono text-body-s text-faint">
                {formatTime(totalDuration(tracks))}
              </span>
            </div>
            <TrackList
              tracks={tracks}
              queue={album.tracks}
              source={album.title}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
