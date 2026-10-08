import { notFound } from "next/navigation";
import DeletePlaylistButton from "@/components/DeletePlaylistButton";
import PlayButton from "@/components/PlayButton";
import PlaylistCover from "@/components/PlaylistCover";
import PlaylistTitle from "@/components/PlaylistTitle";
import TrackList from "@/components/TrackList";
import { READ_ONLY } from "@/lib/config";
import { getPlaylist } from "@/lib/db";
import { plural, totalDuration } from "@/lib/format";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playlist = await getPlaylist(id);
  if (!playlist) notFound();

  const minutes = Math.round(totalDuration(playlist.tracks) / 60);
  const hasTracks = playlist.tracks.length > 0;

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:gap-8">
        <div className="w-40 shrink-0 sm:w-52">
          <PlaylistCover covers={playlist.covers} />
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <p className="font-mono text-label uppercase text-faint">Playlist</p>
          {READ_ONLY ? (
            <h1 className="break-words font-display text-display-l md:text-display-xl">
              {playlist.name}
            </h1>
          ) : (
            <PlaylistTitle id={playlist.id} name={playlist.name} />
          )}
          <p className="text-body-m text-soft">
            {plural(playlist.tracks.length, "song")}
            {hasTracks && `, ${minutes} min`}
          </p>
          <div className="mt-2 flex items-center gap-4">
            {hasTracks && (
              <PlayButton queue={playlist.tracks} source={playlist.name} />
            )}
            {!READ_ONLY && (
              <DeletePlaylistButton id={playlist.id} name={playlist.name} />
            )}
          </div>
        </div>
      </header>

      {hasTracks ? (
        <TrackList
          tracks={playlist.tracks}
          playlistId={playlist.id}
          source={playlist.name}
        />
      ) : (
        <p className="text-body-m text-soft">
          {READ_ONLY
            ? "This playlist is empty."
            : "This playlist is empty. Use the ··· menu on any song to add it here."}
        </p>
      )}
    </div>
  );
}
