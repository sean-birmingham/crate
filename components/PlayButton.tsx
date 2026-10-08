"use client";

import { Pause, Play } from "lucide-react";
import { usePlayer } from "./player/PlayerProvider";
import type { PlayableTrack } from "@/lib/types";

export default function PlayButton({
  queue,
  source,
}: {
  queue: PlayableTrack[];
  source?: string;
}) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const isThisQueue = queue.some((t) => t.id === current?.id);
  const showPause = isThisQueue && isPlaying;

  return (
    <button
      onClick={() => (isThisQueue ? toggle() : play(queue, 0, source))}
      aria-label={showPause ? "Pause" : "Play"}
      className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform hover:scale-105"
    >
      {showPause ? (
        <Pause size={24} fill="currentColor" />
      ) : (
        <Play size={24} fill="currentColor" className="ml-0.5" />
      )}
    </button>
  );
}
