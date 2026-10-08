"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Maximize2,
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
import { READ_ONLY } from "@/lib/config";
import { formatTime } from "@/lib/format";
import GrooveSlider from "./GrooveSlider";
import LikeButton from "./LikeButton";
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
    setNowPlayingOpen,
  } = usePlayer();
  const { time, duration } = useProgress();

  const toggleClass = (on: boolean) =>
    on ? "text-accent" : "text-on-deck-soft hover:text-on-deck";

  return (
    // Tablet and desktop only; phones get the mini player in MobileDock.
    <footer className="col-span-2 hidden items-center bg-deck px-4 text-on-deck md:flex lg:px-6 dark:border-t dark:border-line">
      {/* Left: what's playing */}
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        {current ? (
          <>
            <button
              onClick={() => setNowPlayingOpen(true)}
              aria-label="Open now playing"
              className="shrink-0 rounded-sm transition-transform hover:scale-105"
            >
              <Image
                src={current.cover}
                alt=""
                width={56}
                height={56}
                unoptimized={current.cover.endsWith(".svg")}
                className="size-14 rounded-sm object-cover"
              />
            </button>
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
            {!READ_ONLY && (
              <LikeButton
                id={current.id}
                title={current.title}
                idleClass="text-on-deck-soft hover:text-accent"
              />
            )}
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
      <div className="flex w-full max-w-[560px] flex-col items-center gap-2 px-4 lg:px-8">
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
            className="grid size-10 place-items-center rounded-full bg-accent text-on-accent disabled:opacity-40"
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
          <GrooveSlider
            label="Seek"
            value={time}
            max={duration}
            onChange={seek}
            className="flex-1"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: now playing + volume (the volume slider needs desktop width) */}
      <div className="flex flex-1 items-center justify-end gap-4 text-on-deck-soft">
        {current && (
          <button
            aria-label="Open now playing"
            onClick={() => setNowPlayingOpen(true)}
            className="hover:text-on-deck"
          >
            <Maximize2 size={18} strokeWidth={1.75} />
          </button>
        )}
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
        <GrooveSlider
          label="Volume"
          value={muted ? 0 : volume}
          max={1}
          step={0.01}
          onChange={setVolume}
          className="hidden w-24 lg:block"
        />
      </div>
    </footer>
  );
}
