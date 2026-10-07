import Image from "next/image";
import Link from "next/link";
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
              <Link
                href={`/album/${album.id}`}
                className="group flex flex-col gap-3"
              >
                <Image
                  src={album.cover}
                  alt=""
                  width={196}
                  height={196}
                  unoptimized={album.cover.endsWith(".svg")}
                  className="aspect-square w-full rounded-sm object-cover shadow-[0_8px_18px_-4px_rgb(30_25_21/0.22)]"
                />
                <div>
                  <p className="text-heading-s group-hover:underline">
                    {album.title}
                  </p>
                  <p className="text-body-s text-soft">{album.artist.name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
