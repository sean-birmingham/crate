"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { rememberAlbum } from "@/lib/recent";
import {
  DEFAULT_VOLUME,
  getMuted,
  getVolume,
  saveMuted,
  saveVolume,
  subscribeVolume,
} from "@/lib/volume";
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
  queueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
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
  playNext: (track: PlayableTrack) => void;
  addToQueue: (track: PlayableTrack) => void;
  removeFromQueue: (position: number) => void;
  clearUpcoming: () => void;
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
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  // Saved in this browser (lib/volume.ts). The server always renders the default.
  const volume = useSyncExternalStore(
    subscribeVolume,
    getVolume,
    () => DEFAULT_VOLUME
  );
  const muted = useSyncExternalStore(subscribeVolume, getMuted, () => false);

  const current = queue[index] ?? null;
  const isShuffled = original !== null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // autoplay = false loads a song paused (used when you queue something while nothing is playing).
  function load(newQueue: PlayableTrack[], newIndex: number, autoplay = true) {
    const audio = audioRef.current;
    const track = newQueue[newIndex];
    if (!audio || !track) return;
    setQueue(newQueue);
    setIndex(newIndex);
    audio.src = track.src;
    if (autoplay) {
      audio.play().catch(() => {});
      rememberAlbum(track.albumId);
    }
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
    saveVolume(value);
    if (value > 0 && muted) saveMuted(false);
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

  // Put a song straight after the current one ("Play next") or at the end of the queue ("Add to queue").
  function enqueue(track: PlayableTrack, playNext: boolean) {
    if (!current) {
      setSource(null);
      return load([track], 0, false);
    }
    const insert = (list: PlayableTrack[], at: number) => [
      ...list.slice(0, at),
      track,
      ...list.slice(at),
    ];
    setQueue(insert(queue, playNext ? index + 1 : queue.length));
    // While shuffled, add it to the original order too, so turning shuffle off keeps it.
    if (original) {
      const afterCurrent = original.findIndex((t) => t.id === current.id) + 1;
      setOriginal(insert(original, playNext ? afterCurrent : original.length));
    }
  }

  // Only songs after the current one can be removed.
  function removeFromQueue(position: number) {
    const track = queue[position];
    if (position <= index || !track) return;
    setQueue(queue.filter((_, i) => i !== position));
    if (original) {
      const at = original.indexOf(track);
      setOriginal(original.filter((_, i) => i !== at));
    }
  }

  function clearUpcoming() {
    const kept = queue.slice(0, index + 1);
    setQueue(kept);
    if (original) setOriginal(kept);
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
        queueOpen,
        setQueueOpen,
        play,
        jumpTo,
        toggle,
        next,
        previous,
        seek,
        setVolume,
        toggleMute: () => saveMuted(!muted),
        toggleShuffle,
        cycleRepeat,
        playNext: (track) => enqueue(track, true),
        addToQueue: (track) => enqueue(track, false),
        removeFromQueue,
        clearUpcoming,
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
