import AlbumCard from "@/components/AlbumCard";
import { getAlbums } from "@/lib/db";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-display text-display-l font-normal italic">
          Good evening
        </h1>
        <p className="mt-1 text-body-m text-soft">
          Tuesday night. Something slow, maybe?
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-m">Fresh in the crate</h2>

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8">
          {albums.map((album) => (
            <li key={album.id}>
              <AlbumCard album={album} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
