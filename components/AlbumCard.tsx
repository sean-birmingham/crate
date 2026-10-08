import Image from "next/image";
import Link from "next/link";
import type { AlbumWithArtist } from "@/lib/types";

export default function AlbumCard({
  album,
  eager = false,
}: {
  album: AlbumWithArtist;
  eager?: boolean;
}) {
  return (
    <Link href={`/album/${album.id}`} className="group flex flex-col gap-3.5">
      <div className="relative aspect-[228/196] w-full">
        <Image
          src="/vinyl.svg"
          alt=""
          width={184}
          height={184}
          unoptimized
          loading={eager ? "eager" : "lazy"}
          className="absolute right-0 top-[3%] h-[94%] w-auto transition-transform duration-500 group-hover:translate-x-3 group-hover:rotate-90 dark:drop-shadow-[0_0_1px_rgb(243_235_221/0.45)]"
        />
        <Image
          src={album.cover}
          alt=""
          width={196}
          height={196}
          unoptimized={album.cover.endsWith(".svg")}
          loading={eager ? "eager" : "lazy"}
          className="relative aspect-square h-full w-auto rounded-sm object-cover shadow-[0_8px_18px_-4px_rgb(30_25_21/0.22)]"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-heading-s group-hover:underline">
          {album.title}
        </p>
        <p className="truncate text-body-s text-soft">{album.artist.name}</p>
      </div>
    </Link>
  );
}
