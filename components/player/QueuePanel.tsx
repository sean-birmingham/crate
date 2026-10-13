"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { formatTime } from "@/lib/format";
import type { PlayableTrack } from "@/lib/types";
import { usePlayer } from "./PlayerProvider";

export default function QueuePanel() {
  const { current, queueOpen } = usePlayer();
  if (!queueOpen || !current) return null;
  return <QueueView />;
}

function QueueView() {
  const {
    current,
    queue,
    index,
    source,
    jumpTo,
    removeFromQueue,
    clearUpcoming,
    setQueueOpen,
  } = usePlayer();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move keyboard focus into the panel when it opens.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape closes the queue. Listening in the capture phase runs this before Now Playing's Escape
  // handler, and stopPropagation stops that one, so Now Playing stays open underneath.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setQueueOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [setQueueOpen]);

  if (!current) return null;

  const close = () => setQueueOpen(false);
  const upcoming = queue.slice(index + 1);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Dimmed backdrop: clicking it closes the panel */}
      <div
        onClick={close}
        aria-hidden
        className="absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="queue-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] animate-slide-in flex-col bg-paper text-ink shadow-[-24px_0_48px_-24px_rgb(0_0_0/0.5)] motion-reduce:animate-none"
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <h2 id="queue-title" className="font-display text-heading-m">
              Queue
            </h2>
            <p className="mt-1 truncate font-mono text-label uppercase text-faint">
              Playing from {source ?? current.albumTitle}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={close}
            aria-label="Close queue"
            className="text-soft hover:text-ink"
          >
            <X size={24} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <p className="px-3 pb-2 font-mono text-label uppercase text-faint">
            Now playing
          </p>
          <ul>
            <QueueRow track={current} isCurrent />
          </ul>

          <div className="mt-6 flex items-center justify-between px-3 pb-2">
            <p className="font-mono text-label uppercase text-faint">
              Next up · {upcoming.length}
            </p>
            {upcoming.length > 0 && (
              <button
                onClick={clearUpcoming}
                className="font-mono text-label uppercase text-soft hover:text-accent"
              >
                Clear
              </button>
            )}
          </div>

          {upcoming.length > 0 ? (
            <ol>
              {upcoming.map((track, i) => {
                const position = index + 1 + i; // where it sits in the whole queue
                return (
                  <QueueRow
                    key={`${track.id}-${position}`} // the same song can be queued twice
                    track={track}
                    onPlay={() => jumpTo(position)}
                    onRemove={() => removeFromQueue(position)}
                  />
                );
              })}
            </ol>
          ) : (
            <p className="px-3 py-4 text-body-s text-soft">
              Nothing after this song. Use the ⋯ menu on any song to add more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type RowProps = {
  track: PlayableTrack;
  isCurrent?: boolean;
  onPlay?: () => void;
  onRemove?: () => void;
};

function QueueRow({ track, isCurrent = false, onPlay, onRemove }: RowProps) {
  const body = (
    <>
      <Image
        src={track.cover}
        alt=""
        width={44}
        height={44}
        unoptimized={track.cover.endsWith(".svg")}
        className="size-11 shrink-0 rounded-md object-cover"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-body-m font-medium ${isCurrent ? "text-accent" : ""}`}
        >
          {track.title}
        </span>
        <span className="block truncate text-body-s text-soft">
          {track.artistName}
        </span>
      </span>
      <span className="font-mono text-body-s text-soft">
        {formatTime(track.duration)}
      </span>
    </>
  );

  return (
    <li className="group flex items-center gap-1 rounded-[10px] hover:bg-raised">
      {onPlay ? (
        <button
          onClick={onPlay}
          aria-label={`Play ${track.title}`}
          className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 text-left"
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-3">
          {body}
        </div>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${track.title} from the queue`}
          className="mr-1.5 grid size-8 shrink-0 place-items-center rounded-full text-faint hover:bg-sunken hover:text-ink focus-visible:opacity-100 can-hover:opacity-0 can-hover:group-hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </li>
  );
}
