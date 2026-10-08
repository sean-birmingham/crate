import AlbumCard from "@/components/AlbumCard";
import Greeting from "@/components/Greeting";
import { getAlbums } from "@/lib/db";
import { cardGrid } from "@/lib/ui";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <Greeting />
      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-m">Fresh in the crate</h2>
        <ul className={cardGrid}>
          {albums.map((album, i) => (
            <li key={album.id}>
              <AlbumCard album={album} eager={i < 4} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
