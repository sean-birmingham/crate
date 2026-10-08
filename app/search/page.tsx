import AlbumCard from "@/components/AlbumCard";
import GenreDivider from "@/components/GenreDivider";
import SearchField from "@/components/SearchField";
import TopResultCard from "@/components/TopResultCard";
import TrackList from "@/components/TrackList";
import { getGenres, search } from "@/lib/db";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await search(query) : null;
  const genres = query ? [] : await getGenres();
  const isEmpty =
    results &&
    !results.tracks.length &&
    !results.albums.length &&
    !results.artists.length;
  const source = `Search: “${query}”`;

  return (
    <div className="flex flex-col gap-10">
      <SearchField initialQuery={query} />

      {!query && (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-heading-m">Browse the crates</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-x-8">
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
          album, song or genre.
        </p>
      )}

      {results && !isEmpty && (
        <>
          <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)]">
            {results.top && (
              <section className="flex flex-col gap-4">
                <h2 className="font-display text-heading-m">Top result</h2>
                <TopResultCard result={results.top} tracks={results.tracks} />
              </section>
            )}
            {results.tracks.length > 0 && (
              <section className="flex min-w-0 flex-col gap-4 lg:col-start-2">
                <h2 className="font-display text-heading-m">Songs</h2>
                <TrackList
                  tracks={results.tracks.slice(0, 5)}
                  source={source}
                />
              </section>
            )}
          </div>

          {results.albums.length > 0 && (
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-heading-m">Albums</h2>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-8">
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
