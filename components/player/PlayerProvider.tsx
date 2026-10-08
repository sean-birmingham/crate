"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { PlayableTrack } from "@/lib/types";

type Repeat = "off" | "all" | "one";

type Player = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  current: PlayableTrack | null;
  queue: PlayableTrack[];
  index: number;
  source: string | null;
  isPlaying: boolean;
  isShuffled: boolean;
  repeat: Repeat;
  volume: number;
  muted: boolean;
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  play: (queue: PlayableTrack[], startIndex?: number, source?: string) => void;
  jumpTo: (index: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

const PlayerContext = createContext<Player | null>(null);

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [source, setSource] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [original, setOriginal] = useState<PlayableTrack[] | null>(null); // unshuffled order; null = shuffle off
  const [repeat, setRepeat] = useState<Repeat>("off");
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const current = queue[index] ?? null;
  const isShuffled = original !== null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  function load(newQueue: PlayableTrack[], newIndex: number) {
    const audio = audioRef.current;
    if (!audio || !newQueue[newIndex]) return;
    setQueue(newQueue);
    setIndex(newIndex);
    audio.src = newQueue[newIndex].src;
    audio.play().catch(() => {});
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function play(newQueue: PlayableTrack[], startIndex = 0, newSource?: string) {
    const start = newQueue[startIndex];
    if (!start) return;
    if (start.id === current?.id) return toggle();

    setSource(newSource ?? null);
    if (isShuffled) {
      setOriginal(newQueue);
      load([start, ...shuffled(newQueue.filter((t) => t.id !== start.id))], 0);
    } else {
      load(newQueue, startIndex);
    }
  }

  function jumpTo(newIndex: number) {
    load(queue, newIndex);
  }

  function next() {
    if (index < queue.length - 1) load(queue, index + 1);
    else if (repeat === "all") load(queue, 0);
  }

  function previous() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > 3 || index === 0) audio.currentTime = 0;
    else load(queue, index - 1);
  }

  function handleEnded() {
    const audio = audioRef.current;
    if (repeat === "one" && audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      next();
    }
  }

  function seek(seconds: number) {
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }

  function setVolume(value: number) {
    setVolumeState(value);
    if (value > 0) setMuted(false);
  }

  function toggleShuffle() {
    if (isShuffled) {
      const restored = original;
      setQueue(restored);
      setIndex(
        Math.max(
          0,
          restored.findIndex((t) => t.id === current?.id)
        )
      );
      setOriginal(null);
    } else {
      setOriginal(queue);
      if (current) {
        setQueue([
          current,
          ...shuffled(queue.filter((t) => t.id !== current.id)),
        ]);
        setIndex(0);
      }
    }
  }

  function cycleRepeat() {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }

  return (
    <PlayerContext
      value={{
        audioRef,
        current,
        queue,
        index,
        source,
        isPlaying,
        isShuffled,
        repeat,
        volume,
        muted,
        nowPlayingOpen,
        setNowPlayingOpen,
        play,
        jumpTo,
        toggle,
        next,
        previous,
        seek,
        setVolume,
        toggleMute: () => setMuted((m) => !m),
        toggleShuffle,
        cycleRepeat,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
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

// Only components that call this re-render on every time update.
export function useProgress() {
  const { audioRef } = usePlayer();
  const [progress, setProgress] = useState({ time: 0, duration: 0 });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () =>
      setProgress({ time: audio.currentTime, duration: audio.duration || 0 });
    const events = [
      "timeupdate",
      "loadedmetadata",
      "durationchange",
      "emptied",
    ];
    events.forEach((e) => audio.addEventListener(e, update));
    return () => events.forEach((e) => audio.removeEventListener(e, update));
  }, [audioRef]);

  return progress;
}
