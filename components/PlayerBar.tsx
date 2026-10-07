import {
  Shuffle,
  SkipBack,
  Play,
  SkipForward,
  Repeat,
  ListMusic,
  Volume2,
} from "lucide-react";

export default function PlayerBar() {
  return (
    <footer className="col-span-2 flex items-center bg-deck px-6 text-on-deck">
      {/* Left: what's playing */}
      <div className="flex flex-1 items-center gap-3.5">
        <div className="grid size-14 place-items-center rounded-full bg-deck-raised">
          <div className="size-5 rounded-full bg-groove" />
        </div>
        <p className="text-body-m text-on-deck-soft">Nothing playing</p>
      </div>

      {/* Center: controls + progress */}
      <div className="flex w-full max-w-140 flex-col items-center gap-2 px-8">
        <div className="flex items-center gap-6">
          <button
            aria-label="Shuffle"
            className="text-on-deck-soft hover:text-on-deck"
          >
            <Shuffle size={20} strokeWidth={1.75} />
          </button>
          <button aria-label="Previous" className="hover:text-accent">
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button
            aria-label="Play"
            className="grid size-10 place-items-center rounded-full bg-accent"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </button>
          <button aria-label="Next" className="hover:text-accent">
            <SkipForward size={22} fill="currentColor" />
          </button>
          <button
            aria-label="Repeat"
            className="text-on-deck-soft hover:text-on-deck"
          >
            <Repeat size={20} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex w-full items-center gap-3 font-mono text-body-s text-on-deck-soft">
          <span>0:00</span>
          <div className="h-1 flex-1 rounded-full bg-groove">
            <div className="h-full w-0 rounded-full bg-accent" />
          </div>
          <span>0:00</span>
        </div>
      </div>

      {/* Right: queue + volume */}
      <div className="flex flex-1 items-center justify-end gap-4 text-on-deck-soft">
        <ListMusic size={20} strokeWidth={1.75} />
        <Volume2 size={20} strokeWidth={1.75} />
        <div className="h-1 w-24 rounded-full bg-groove">
          <div className="h-full w-[70%] rounded-full bg-accent" />
        </div>
      </div>
    </footer>
  );
}
