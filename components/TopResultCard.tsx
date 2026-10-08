import Image from "next/image";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { initials, plural } from "@/lib/format";
import type { PlayableTrack, TopResult } from "@/lib/types";
import PlayButton from "./PlayButton";

const coverClass =
  "size-28 rounded-sm object-cover shadow-[0_10px_22px_-6px_rgb(30_25_21/0.3)]";

function describe(result: TopResult, tracks: PlayableTrack[]) {
  switch (result.kind) {
    case "artist":
      return {
        href: `/artist/${result.artist.id}`,
        title: result.artist.name,
        meta: "Artist",
        queue: tracks.filter((t) => t.artistId === result.artist.id),
        visual: (
          <span className="grid size-28 place-items-center rounded-full bg-accent font-display text-display-l text-on-accent">
            {initials(result.artist.name)}
          </span>
        ),
      };
    case "album":
      return {
        href: `/album/${result.album.id}`,
        title: result.album.title,
        meta: `Album · ${result.album.artist.name}`,
        queue: tracks.filter((t) => t.albumId === result.album.id),
        visual: (
          <Image
            src={result.album.cover}
            alt=""
            width={112}
            height={112}
            unoptimized={result.album.cover.endsWith(".svg")}
            className={coverClass}
          />
        ),
      };
    case "track":
      return {
        href: `/album/${result.track.albumId}`,
        title: result.track.title,
        meta: `Song · ${result.track.artistName}`,
        queue: [result.track],
        visual: (
          <Image
            src={result.track.cover}
            alt=""
            width={112}
            height={112}
            unoptimized={result.track.cover.endsWith(".svg")}
            className={coverClass}
          />
        ),
      };
    case "genre":
      return {
        href: `/search?q=${encodeURIComponent(result.name)}`,
        title: result.name,
        meta: `Genre · ${plural(result.albumCount, "album")}`,
        queue: tracks,
        visual: (
          <span className="grid size-28 place-items-center rounded-sm bg-teal text-on-deck">
            <Disc3 size={48} strokeWidth={1.25} />
          </span>
        ),
      };
  }
}

export default function TopResultCard({
  result,
  tracks,
}: {
  result: TopResult;
  tracks: PlayableTrack[];
}) {
  const { href, title, meta, visual, queue } = describe(result, tracks);

  return (
    <div className="relative flex flex-col gap-4 rounded-[20px] border border-line bg-raised p-6 transition-colors hover:bg-paper md:p-7">
      {visual}
      {/* The link stretches over the whole card; the play button sits above it. */}
      <Link
        href={href}
        className="font-display text-heading-m after:absolute after:inset-0 after:rounded-[20px] md:text-display-l"
      >
        {title}
      </Link>
      <div className="flex items-center justify-between gap-4">
        <span className="truncate rounded-full bg-sunken px-3 py-1.5 font-mono text-label uppercase text-soft">
          {meta}
        </span>
        {queue.length > 0 && (
          <div className="relative z-10">
            <PlayButton queue={queue} source={title} />
          </div>
        )}
      </div>
    </div>
  );
}
