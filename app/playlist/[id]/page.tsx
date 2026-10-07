import { notFound } from "next/navigation";
import DeletePlaylistButton from "@/components/DeletePlaylistButton";
import PlayButton from "@/components/PlayButton";
import PlaylistCover from "@/components/PlaylistCover";
import TrackList from "@/components/TrackList";
import { getPlaylist } from "@/lib/db";
import { plural, totalDuration } from "@/lib/format";
import PlaylistTitle from "@/components/PlaylistTitle";

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
    <div className="flex flex-col gap-10">
      <header className="flex items-end gap-8">
        <PlaylistCover covers={playlist.covers} size={208} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="font-mono text-label uppercase text-faint">Playlist</p>

          <PlaylistTitle id={playlist.id} name={playlist.name} />

          <p className="text-body-m text-soft">
            {plural(playlist.tracks.length, "song")}
            {hasTracks && `, ${minutes} min`}
          </p>
          <div className="mt-2 flex items-center gap-4">
            {hasTracks && <PlayButton queue={playlist.tracks} />}
            <DeletePlaylistButton id={playlist.id} name={playlist.name} />
          </div>
        </div>
      </header>

      {hasTracks ? (
        <TrackList tracks={playlist.tracks} playlistId={playlist.id} />
      ) : (
        <p className="text-body-m text-soft">
          This playlist is empty. Use the ··· menu on any song to add it here.
        </p>
      )}
    </div>
  );
}
