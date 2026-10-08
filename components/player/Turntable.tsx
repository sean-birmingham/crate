import Image from "next/image";

// 33⅓ rpm = one full turn every 1.8 seconds. Pausing freezes the record where it is.
export const spin = (isPlaying: boolean) =>
  `animate-spin [animation-duration:1.8s] motion-reduce:animate-none ${isPlaying ? "" : "[animation-play-state:paused]"}`;

export function Turntable({
  cover,
  isPlaying,
}: {
  cover: string;
  isPlaying: boolean;
}) {
  return (
    <div className="relative aspect-[640/620] w-full rounded-[28px] border border-groove bg-deck-raised">
      <span className="absolute left-[5%] top-[3.5%] font-display text-heading-m text-on-deck-soft/60">
        Crate
      </span>

      {/* Platter */}
      <div className="absolute left-[4.7%] top-[8%] aspect-square w-[84.4%] rounded-full border-2 border-groove bg-deck" />

      {/* Record and label art spin together */}
      <div
        className={`absolute left-[7%] top-[10.5%] aspect-square w-[79.7%] ${spin(isPlaying)}`}
      >
        <Image src="/vinyl.svg" alt="" fill sizes="40vw" unoptimized />
        <div className="absolute inset-[32.75%] overflow-hidden rounded-full ring-4 ring-accent">
          <Image
            src={cover}
            alt=""
            fill
            sizes="180px"
            unoptimized={cover.endsWith(".svg")}
            className="object-cover"
          />
        </div>
        <span className="absolute left-1/2 top-1/2 size-[2.4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-deck" />
      </div>

      {/* Tonearm: swings onto the record while playing, lifts off when paused */}
      <svg
        viewBox="0 0 120 280"
        aria-hidden
        className={`absolute left-[65.6%] top-[6.5%] h-[72.3%] w-[30%] origin-[66.7%_15%] transition-transform duration-700 motion-reduce:transition-none ${
          isPlaying ? "rotate-0" : "-rotate-[22deg]"
        }`}
      >
        <rect x="70" y="4" width="20" height="16" rx="4" fill="#A89B8C" />
        <circle
          cx="80"
          cy="42"
          r="30"
          fill="#2A2420"
          stroke="#3A322C"
          strokeWidth="2"
        />
        <circle cx="80" cy="42" r="12" fill="#A89B8C" />
        <path
          d="M80 42 84 200 62 244"
          fill="none"
          stroke="#CFC2AF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="46"
          y="236"
          width="30"
          height="20"
          rx="4"
          fill="#A89B8C"
          transform="rotate(-28 61 246)"
        />
      </svg>

      {/* Speed selector and power light */}
      <div className="absolute bottom-[4%] left-[5%] flex gap-2 font-mono text-body-s">
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-on-accent">
          33
        </span>
        <span className="rounded-full border border-groove px-2.5 py-0.5 text-on-deck-soft">
          45
        </span>
      </div>
      <div className="absolute bottom-[5%] right-[5%] flex items-center gap-2 font-mono text-label uppercase text-on-deck-soft">
        <span
          className={`size-2 rounded-full ${isPlaying ? "bg-accent shadow-[0_0_8px_var(--color-accent)]" : "bg-groove"}`}
        />
        On
      </div>
    </div>
  );
}

export function Sleeve({
  cover,
  isPlaying,
}: {
  cover: string;
  isPlaying: boolean;
}) {
  return (
    <div className="relative mx-auto aspect-[342/300] w-full max-w-sm">
      <div
        className={`absolute left-[34.5%] top-[5.3%] aspect-square w-[78.4%] ${spin(isPlaying)}`}
      >
        <Image src="/vinyl.svg" alt="" fill sizes="80vw" unoptimized />
      </div>
      <Image
        src={cover}
        alt=""
        width={284}
        height={284}
        loading="eager"
        unoptimized={cover.endsWith(".svg")}
        className="absolute left-0 top-[2.7%] aspect-square w-[83%] rounded-sm object-cover shadow-[0_14px_28px_-6px_rgb(0_0_0/0.5)]"
      />
    </div>
  );
}
