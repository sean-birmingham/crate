import { notFound } from "next/navigation";
import AlbumCard from "@/components/AlbumCard";
import TrackRow from "@/components/TrackRow";
import { getArtist } from "@/lib/db";

function initials(name: string) {
  return name
    .split(" ")
    .filter((word) => word.toLowerCase() !== "the")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <div className="flex flex-col gap-12">
      <header className="flex items-end gap-8">
        <div className="grid size-40 shrink-0 place-items-center rounded-full bg-accent font-display text-display-l text-on-deck">
          {initials(artist.name)}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="font-mono text-label uppercase text-faint">Artist</p>
          <h1 className="font-display text-display-xl">{artist.name}</h1>
          <p className="text-body-m text-soft">
            {plural(artist.albums.length, "album")} ·{" "}
            {plural(artist.tracks.length, "song")}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-heading-m">Songs</h2>
        <ol>
          {artist.tracks.map((track) => (
            <TrackRow key={track.id} track={track} artist={artist} />
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-m">Albums</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8">
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
