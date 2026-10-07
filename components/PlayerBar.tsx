"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { usePlayer } from "./player/PlayerProvider";

export default function PlayerBar() {
  const { current, isPlaying, toggle, next, previous } = usePlayer();

  return (
    <footer className="col-span-2 flex items-center bg-deck px-6 text-on-deck">
      {/* Left: what's playing */}
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        {current ? (
          <>
            <Image
              src={current.cover}
              alt=""
              width={56}
              height={56}
              unoptimized={current.cover?.endsWith(".svg")}
              className="size-14 shrink-0 rounded-sm object-cover"
            />
            <div className="min-w-0">
              <Link
                href={`/album/${current.albumId}`}
                className="block truncate text-body-m font-medium hover:underline"
              >
                {current.title}
              </Link>
              <Link
                href={`/artist/${current.artistId}`}
                className="block truncate text-body-s text-on-deck-soft hover:text-on-deck hover:underline"
              >
                {current.artistName}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-deck-raised">
              <div className="size-5 rounded-full bg-groove" />
            </div>
            <p className="text-body-m text-on-deck-soft">Nothing playing</p>
          </>
        )}
      </div>

      {/* Center: controls + progress (progress/seek come in step 6) */}
      <div className="flex w-full max-w-[560px] flex-col items-center gap-2 px-8">
        <div className="flex items-center gap-6">
          <button
            aria-label="Shuffle"
            className="text-on-deck-soft hover:text-on-deck"
          >
            <Shuffle size={20} strokeWidth={1.75} />
          </button>
          <button
            aria-label="Previous"
            onClick={previous}
            disabled={!current}
            className="hover:text-accent disabled:opacity-40"
          >
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={toggle}
            disabled={!current}
            className="grid size-10 place-items-center rounded-full bg-accent disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            aria-label="Next"
            onClick={next}
            disabled={!current}
            className="hover:text-accent disabled:opacity-40"
          >
            <SkipForward size={22} fill="currentColor" />
          </button>
          <button
            aria-label="Repeat"
            className="text-on-deck-soft hover:text-on-deck"
          >
            <Repeat size={20} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex w-full items-center gap-3 font-mono text-body-s text-on-deck-soft">
          <span>0:00</span>
          <div className="h-1 flex-1 rounded-full bg-groove">
            <div className="h-full w-0 rounded-full bg-accent" />
          </div>
          <span>0:00</span>
        </div>
      </div>

      {/* Right: queue + volume (volume comes in step 6) */}
      <div className="flex flex-1 items-center justify-end gap-4 text-on-deck-soft">
        <ListMusic size={20} strokeWidth={1.75} />
        <Volume2 size={20} strokeWidth={1.75} />
        <div className="h-1 w-24 rounded-full bg-groove">
          <div className="h-full w-[70%] rounded-full bg-accent" />
        </div>
      </div>
    </footer>
  );
}
