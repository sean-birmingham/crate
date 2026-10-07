"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { PlayableTrack } from "@/lib/types";

type Player = {
  current: PlayableTrack | null;
  isPlaying: boolean;
  play: (queue: PlayableTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
};

const PlayerContext = createContext<Player | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const current = queue[index] ?? null;

  function load(newQueue: PlayableTrack[], newIndex: number) {
    const audio = audioRef.current;
    if (!audio || !newQueue[newIndex]) return;
    setQueue(newQueue);
    setIndex(newIndex);
    audio.src = newQueue[newIndex].src;
    audio.play().catch(() => {}); // ignore "interrupted" errors when skipping quickly
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function play(newQueue: PlayableTrack[], startIndex = 0) {
    // Clicking the track that's already loaded pauses or resumes it instead of restarting.
    if (newQueue[startIndex]?.id === current?.id) toggle();
    else load(newQueue, startIndex);
  }

  function next() {
    load(queue, index + 1);
  }

  function previous() {
    const audio = audioRef.current;
    if (!audio) return;
    // Like every music app: restart the song if it's been playing a few seconds, otherwise go back one.
    if (audio.currentTime > 3 || index === 0) audio.currentTime = 0;
    else load(queue, index - 1);
  }

  return (
    <PlayerContext value={{ current, isPlaying, play, toggle, next, previous }}>
      {children}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={next}
      />
    </PlayerContext>
  );
}

export function usePlayer() {
  const player = useContext(PlayerContext);
  if (!player)
    throw new Error("usePlayer must be used inside <PlayerProvider>");
  return player;
}
