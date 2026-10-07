"use client";

import TrackRow from "./TrackRow";
import { usePlayer } from "./player/PlayerProvider";
import type { PlayableTrack } from "@/lib/types";

type Props = {
  tracks: PlayableTrack[];
  queue?: PlayableTrack[]; // what keeps playing afterwards; defaults to the tracks shown
};

export default function TrackList({ tracks, queue = tracks }: Props) {
  const { current, isPlaying, play } = usePlayer();

  return (
    <ol>
      {tracks.map((track) => (
        <TrackRow
          key={track.id}
          track={track}
          isCurrent={current?.id === track.id}
          isPlaying={isPlaying}
          onPlay={() =>
            play(
              queue,
              queue.findIndex((t) => t.id === track.id)
            )
          }
        />
      ))}
    </ol>
  );
}
