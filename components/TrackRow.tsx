import Link from "next/link";
import { Heart, Pause, Play } from "lucide-react";
import { formatTime } from "@/lib/format";
import type { PlayableTrack } from "@/lib/types";

type Props = {
  track: PlayableTrack;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
};

export default function TrackRow({
  track,
  isCurrent,
  isPlaying,
  onPlay,
}: Props) {
  const showPause = isCurrent && isPlaying;

  return (
    <li
      onDoubleClick={onPlay}
      className={`group grid grid-cols-[32px_1fr_auto_48px] items-center gap-4 rounded-[10px] px-4 py-2.5 hover:bg-raised ${
        isCurrent ? "bg-raised" : ""
      }`}
    >
      <button
        onClick={onPlay}
        aria-label={showPause ? `Pause ${track.title}` : `Play ${track.title}`}
        className="text-left"
      >
        <span
          className={`font-mono text-body-s group-hover:hidden ${isCurrent ? "text-accent" : "text-faint"}`}
        >
          {track.side}
        </span>
        <span className="hidden group-hover:block">
          {showPause ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </span>
      </button>

      <div className="flex min-w-0 flex-col">
        <p
          className={`truncate text-body-m font-medium ${isCurrent ? "text-accent" : ""}`}
        >
          {track.title}
        </p>
        <Link
          href={`/artist/${track.artistId}`}
          onDoubleClick={(e) => e.stopPropagation()}
          className="max-w-full self-start truncate text-body-s text-soft hover:text-ink hover:underline"
        >
          {track.artistName}
        </Link>
      </div>

      <button
        aria-label={`Like ${track.title}`}
        className="text-faint opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-accent"
      >
        <Heart size={20} strokeWidth={1.75} />
      </button>

      <span className="text-right font-mono text-body-s text-soft">
        {formatTime(track.duration)}
      </span>
    </li>
  );
}
