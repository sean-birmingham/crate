"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { READ_ONLY } from "@/lib/config";
import { formatTime } from "@/lib/format";
import GrooveSlider from "../GrooveSlider";
import LikeButton from "../LikeButton";
import { usePlayer, useProgress } from "./PlayerProvider";
import { Sleeve, Turntable } from "./Turntable";

export default function NowPlaying() {
  const { current, nowPlayingOpen } = usePlayer();
  if (!nowPlayingOpen || !current) return null;
  return <NowPlayingView />;
}

// A separate component, so the 4-times-a-second progress updates only happen while it's open.
function NowPlayingView() {
  const {
    current,
    queue,
    index,
    source,
    isPlaying,
    isShuffled,
    repeat,
    toggle,
    next,
    previous,
    seek,
    jumpTo,
    toggleShuffle,
    cycleRepeat,
    setNowPlayingOpen,
  } = usePlayer();
  const { time, duration } = useProgress();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move keyboard focus into the view when it opens.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNowPlayingOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setNowPlayingOpen]);

  if (!current) return null;

  const close = () => setNowPlayingOpen(false);
  const upNext = queue.slice(index + 1, index + 4);
  const toggleClass = (on: boolean) =>
    on ? "text-accent" : "text-on-deck-soft hover:text-on-deck";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      className="fixed inset-0 z-50 flex animate-slide-up flex-col overflow-y-auto overflow-x-hidden bg-deck px-6 pb-10 pt-5 text-on-deck motion-reduce:animate-none md:px-14 md:py-8"
    >
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          ref={closeRef}
          onClick={close}
          aria-label="Close now playing"
          className="text-on-deck hover:text-accent"
        >
          <ChevronDown size={28} />
        </button>
        <div className="min-w-0">
          <p className="font-mono text-label uppercase text-on-deck-soft">
            Playing from
          </p>
          <p className="truncate text-body-m font-medium">
            {source ?? current.albumTitle}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 py-6 md:flex-row md:gap-16">
        {/* The record */}
        <div className="w-full md:w-1/2 md:max-w-[640px]">
          <div className="md:hidden">
            <Sleeve cover={current.cover} isPlaying={isPlaying} />
          </div>
          <div className="hidden md:block">
            <Turntable cover={current.cover} isPlaying={isPlaying} />
          </div>
        </div>

        {/* Details and controls */}
        <div className="flex w-full min-w-0 flex-col gap-5 md:flex-1">
          <p className="font-mono text-label uppercase text-accent">
            Side {current.side[0]} · Track {index + 1} of {queue.length}
          </p>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-heading-m md:text-display-xl">
                {current.title}
              </h2>
              <p className="mt-2 text-body-m text-on-deck-soft">
                <Link
                  href={`/artist/${current.artistId}`}
                  onClick={close}
                  className="font-medium text-on-deck hover:underline"
                >
                  {current.artistName}
                </Link>
                {current.albumTitle && (
                  <>
                    {" "}
                    —{" "}
                    <Link
                      href={`/album/${current.albumId}`}
                      onClick={close}
                      className="hover:underline"
                    >
                      {current.albumTitle}
                    </Link>
                  </>
                )}
              </p>
            </div>
            {!READ_ONLY && (
              <div className="mt-2 shrink-0">
                <LikeButton
                  id={current.id}
                  title={current.title}
                  size={28}
                  idleClass="text-on-deck-soft hover:text-accent"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <GrooveSlider
              label="Seek"
              value={time}
              max={duration}
              onChange={seek}
              className="w-full"
            />
            <div className="flex justify-between font-mono text-body-s text-on-deck-soft">
              <span>{formatTime(time)}</span>
              <span>-{formatTime(Math.max(0, duration - time))}</span>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-center md:gap-10">
            <button
              aria-label="Shuffle"
              aria-pressed={isShuffled}
              onClick={toggleShuffle}
              className={toggleClass(isShuffled)}
            >
              <Shuffle size={24} strokeWidth={1.75} />
            </button>
            <button
              aria-label="Previous"
              onClick={previous}
              className="hover:text-accent"
            >
              <SkipBack size={30} fill="currentColor" />
            </button>
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={toggle}
              className="grid size-[72px] place-items-center rounded-full bg-accent text-on-accent md:size-20"
            >
              {isPlaying ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" className="ml-1" />
              )}
            </button>
            <button
              aria-label="Next"
              onClick={next}
              className="hover:text-accent"
            >
              <SkipForward size={30} fill="currentColor" />
            </button>
            <button
              aria-label={`Repeat: ${repeat}`}
              onClick={cycleRepeat}
              className={toggleClass(repeat !== "off")}
            >
              {repeat === "one" ? (
                <Repeat1 size={24} strokeWidth={1.75} />
              ) : (
                <Repeat size={24} strokeWidth={1.75} />
              )}
            </button>
          </div>

          <div className="pt-2">
            <p className="pb-1 font-mono text-label uppercase text-on-deck-soft">
              Up next
            </p>
            {upNext.length > 0 ? (
              <ol>
                {upNext.map((track, i) => (
                  <li key={track.id} className="border-t border-groove">
                    <button
                      onClick={() => jumpTo(index + 1 + i)}
                      className="flex w-full items-center gap-4 py-3 text-left hover:text-accent"
                    >
                      <span className="font-mono text-body-s text-on-deck-soft">
                        {track.side}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body-m font-medium">
                        {track.title}
                      </span>
                      <span className="font-mono text-body-s text-on-deck-soft">
                        {formatTime(track.duration)}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="border-t border-groove py-3 text-body-s text-on-deck-soft">
                That&apos;s the end of the queue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
