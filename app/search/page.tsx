import Link from "next/link";
import AlbumCard from "@/components/AlbumCard";
import GenreDivider from "@/components/GenreDivider";
import SearchField from "@/components/SearchField";
import TrackList from "@/components/TrackList";
import { getGenres, search } from "@/lib/db";
import { initials } from "@/lib/format";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await search(query) : null;
  const genres = query ? [] : await getGenres();

  const top = results?.artists[0];
  const isEmpty =
    results &&
    !results.tracks.length &&
    !results.albums.length &&
    !results.artists.length;

  return (
    <div className="flex flex-col gap-10">
      <SearchField initialQuery={query} />

      {!query && (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-heading-m">Browse the crates</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-8 gap-y-6">
            {genres.map((genre, i) => (
              <li key={genre.name}>
                <GenreDivider name={genre.name} count={genre.count} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {isEmpty && (
        <p className="text-body-m text-soft">
          Nothing in the crate matches &ldquo;{query}&rdquo;. Try an artist,
          album or song title.
        </p>
      )}

      {results && !isEmpty && (
        <>
          <div className="grid grid-cols-[380px_1fr] gap-10">
            {top && (
              <section className="flex flex-col gap-4">
                <h2 className="font-display text-heading-m">Top result</h2>
                <Link
                  href={`/artist/${top.id}`}
                  className="flex flex-col gap-4 rounded-[20px] border border-line bg-raised p-7 transition-colors hover:bg-paper"
                >
                  <span className="grid size-28 place-items-center rounded-full bg-accent font-display text-display-l text-on-deck">
                    {initials(top.name)}
                  </span>
                  <span className="font-display text-display-l">
                    {top.name}
                  </span>
                  <span className="self-start rounded-full bg-sunken px-3 py-1.5 font-mono text-label uppercase text-soft">
                    Artist
                  </span>
                </Link>
              </section>
            )}

            {results.tracks.length > 0 && (
              <section className="col-start-2 flex min-w-0 flex-col gap-4">
                <h2 className="font-display text-heading-m">Songs</h2>
                <TrackList tracks={results.tracks.slice(0, 5)} />
              </section>
            )}
          </div>

          {results.albums.length > 0 && (
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-heading-m">Albums</h2>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8">
                {results.albums.map((album) => (
                  <li key={album.id}>
                    <AlbumCard album={album} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
