import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { READ_ONLY } from "@/lib/config";
import { formatTime } from "@/lib/format";
import type { PlayableTrack } from "@/lib/types";
import LikeButton from "./LikeButton";
import TrackMenu from "./TrackMenu";

type Props = {
  track: PlayableTrack;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  playlistId?: string;
};

export default function TrackRow({
  track,
  isCurrent,
  isPlaying,
  onPlay,
  playlistId,
}: Props) {
  const showPause = isCurrent && isPlaying;

  // On touch screens a single tap on the row plays it (desktop keeps double-click).
  function handleClick(e: React.MouseEvent) {
    const onControl = (e.target as HTMLElement).closest("a, button");
    if (!onControl && window.matchMedia("(hover: none)").matches) onPlay();
  }

  return (
    <li
      onClick={handleClick}
      onDoubleClick={onPlay}
      className={`group grid grid-cols-[28px_1fr_auto_44px] items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-raised sm:grid-cols-[32px_1fr_auto_48px] sm:gap-4 sm:px-4 ${
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

      <div className="flex items-center gap-3 sm:gap-4">
        {!READ_ONLY && (
          <>
            <LikeButton id={track.id} title={track.title} hideUntilHover />
            <TrackMenu
              trackId={track.id}
              title={track.title}
              playlistId={playlistId}
            />
          </>
        )}
      </div>

      <span className="text-right font-mono text-body-s text-soft">
        {formatTime(track.duration)}
      </span>
    </li>
  );
}
