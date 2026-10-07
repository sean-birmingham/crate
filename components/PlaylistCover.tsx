import Image from "next/image";

type Props = { covers: string[]; size?: number }; // no size = fill the parent's width

export default function PlaylistCover({ covers, size }: Props) {
  const box = size ? { width: size, height: size } : undefined;
  const fluid = size ? "" : "aspect-square w-full";
  const px = size ?? 240; // resolution to load the images at

  if (covers.length >= 4) {
    return (
      <div
        style={box}
        className={`grid shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-sm ${fluid}`}
      >
        {covers.slice(0, 4).map((src) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={px / 2}
            height={px / 2}
            unoptimized={src.endsWith(".svg")}
            className="size-full object-cover"
          />
        ))}
      </div>
    );
  }

  if (covers.length > 0) {
    return (
      <Image
        src={covers[0]}
        alt=""
        width={px}
        height={px}
        unoptimized={covers[0].endsWith(".svg")}
        style={box}
        className={`shrink-0 rounded-sm object-cover ${fluid}`}
      />
    );
  }

  return (
    <div
      style={box}
      className={`grid shrink-0 place-items-center rounded-sm bg-deck ${fluid}`}
    >
      <span className="size-1/4 rounded-full bg-accent" />
    </div>
  );
}
