"use client";

import { Pause, Play } from "lucide-react";
import { usePlayer } from "./player/PlayerProvider";
import type { PlayableTrack } from "@/lib/types";

export default function PlayButton({ queue }: { queue: PlayableTrack[] }) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const isThisQueue = queue.some((t) => t.id === current?.id);
  const showPause = isThisQueue && isPlaying;

  return (
    <button
      onClick={() => (isThisQueue ? toggle() : play(queue, 0))}
      aria-label={showPause ? "Pause" : "Play"}
      className="grid size-14 place-items-center rounded-full bg-accent text-on-deck"
    >
      {showPause ? (
        <Pause size={24} fill="currentColor" />
      ) : (
        <Play size={24} fill="currentColor" className="ml-0.5" />
      )}
    </button>
  );
}
