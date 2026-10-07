import { Heart } from "lucide-react";
import { formatTime } from "@/lib/format";
import type { Track } from "@/lib/types";

export default function TrackRow({
  track,
  artistName,
}: {
  track: Track;
  artistName: string;
}) {
  return (
    <li className="group grid grid-cols-[32px_1fr_auto_48px] items-center gap-4 rounded-[10px] px-4 py-2.5 hover:bg-raised">
      <span className="font-mono text-body-s text-faint">{track.side}</span>
      <div className="min-w-0">
        <p className="truncate text-body-m font-medium">{track.title}</p>
        <p className="truncate text-body-s text-faint">{artistName}</p>
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
