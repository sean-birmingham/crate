import { Heart } from "lucide-react";
import PlayButton from "@/components/PlayButton";
import TrackList from "@/components/TrackList";
import { getLikedTracks } from "@/lib/db";
import { plural } from "@/lib/format";

export default async function LikedPage() {
  const tracks = await getLikedTracks();

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:gap-8">
        <div className="grid size-40 shrink-0 place-items-center rounded-sm bg-accent-soft text-accent sm:size-52">
          <Heart size={64} fill="currentColor" strokeWidth={0} />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="font-mono text-label uppercase text-faint">Playlist</p>
          <h1 className="font-display text-display-l md:text-display-xl">
            Liked songs
          </h1>
          <p className="text-body-m text-soft">
            {plural(tracks.length, "song")}
          </p>
          {tracks.length > 0 && (
            <div className="mt-2">
              <PlayButton queue={tracks} source="Liked songs" />
            </div>
          )}
        </div>
      </header>

      {tracks.length > 0 ? (
        <TrackList tracks={tracks} source="Liked songs" />
      ) : (
        <p className="text-body-m text-soft">
          Songs you like will show up here. Tap the heart on any track.
        </p>
      )}
    </div>
  );
}
