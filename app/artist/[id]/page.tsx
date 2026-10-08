import { notFound } from "next/navigation";
import AlbumCard from "@/components/AlbumCard";
import PlayButton from "@/components/PlayButton";
import TrackList from "@/components/TrackList";
import { getArtist } from "@/lib/db";
import { initials, plural } from "@/lib/format";
import { cardGrid } from "@/lib/ui";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-8">
        <div className="grid size-28 shrink-0 place-items-center rounded-full bg-accent font-display text-heading-m text-on-accent sm:size-40 sm:text-display-l">
          {initials(artist.name)}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="font-mono text-label uppercase text-faint">Artist</p>
          <h1 className="wrap-break-word font-display text-display-l md:text-display-xl">
            {artist.name}
          </h1>
          <p className="text-body-m text-soft">
            {plural(artist.albums.length, "album")} ·{" "}
            {plural(artist.tracks.length, "song")}
          </p>
          <div className="mt-2">
            <PlayButton queue={artist.tracks} source={artist.name} />
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-heading-m">Songs</h2>
        <TrackList tracks={artist.tracks} source={artist.name} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-m">Albums</h2>
        <ul className={cardGrid}>
          {artist.albums.map((album) => (
            <li key={album.id}>
              <AlbumCard album={album} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
