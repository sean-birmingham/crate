"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/lib/format";
import { usePlayer, useProgress } from "./player/PlayerProvider";

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    isShuffled,
    repeat,
    volume,
    muted,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();
  const { time, duration } = useProgress();

  const toggleClass = (on: boolean) =>
    on ? "text-accent" : "text-on-deck-soft hover:text-on-deck";

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
              unoptimized={current.cover.endsWith(".svg")}
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

      {/* Center: controls + progress */}
      <div className="flex w-full max-w-[560px] flex-col items-center gap-2 px-8">
        <div className="flex items-center gap-6">
          <button
            aria-label="Shuffle"
            aria-pressed={isShuffled}
            onClick={toggleShuffle}
            className={toggleClass(isShuffled)}
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
            aria-label={`Repeat: ${repeat}`}
            onClick={cycleRepeat}
            className={toggleClass(repeat !== "off")}
          >
            {repeat === "one" ? (
              <Repeat1 size={20} strokeWidth={1.75} />
            ) : (
              <Repeat size={20} strokeWidth={1.75} />
            )}
          </button>
        </div>

        <div className="flex w-full items-center gap-3 font-mono text-body-s text-on-deck-soft">
          <span className="w-10 text-right">{formatTime(time)}</span>
          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={duration}
            step="any"
            value={Math.min(time, duration)}
            disabled={!duration}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-accent disabled:cursor-default"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: queue + volume */}
      <div className="flex flex-1 items-center justify-end gap-4 text-on-deck-soft">
        <ListMusic size={20} strokeWidth={1.75} />
        <button
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={toggleMute}
          className="hover:text-on-deck"
        >
          {muted || volume === 0 ? (
            <VolumeX size={20} strokeWidth={1.75} />
          ) : (
            <Volume2 size={20} strokeWidth={1.75} />
          )}
        </button>
        <input
          type="range"
          aria-label="Volume"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer accent-accent"
        />
      </div>
    </footer>
  );
}
