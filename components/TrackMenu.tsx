"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  addToPlaylist,
  createPlaylist,
  removeFromPlaylist,
} from "@/lib/actions";
import { useLibrary } from "./LibraryProvider";

type Props = { trackId: string; title: string; playlistId?: string };

export default function TrackMenu({ trackId, title, playlistId }: Props) {
  const { playlists } = useLibrary();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside the menu, or on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function run(action: () => Promise<unknown>) {
    setOpen(false);
    startTransition(async () => {
      await action();
    });
  }

  return (
    <div
      ref={ref}
      className="relative"
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <button
        aria-label={`More options for ${title}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`text-faint hover:text-ink ${
          open
            ? ""
            : "can-hover:opacity-0 can-hover:group-hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-raised p-1.5 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.3)]"
        >
          <p className="px-3 pb-1 pt-2 font-mono text-label uppercase text-faint">
            Add to playlist
          </p>
          <MenuItem onClick={() => run(() => createPlaylist([trackId]))}>
            <Plus size={16} /> New playlist
          </MenuItem>
          {playlists.map((p) => (
            <MenuItem
              key={p.id}
              onClick={() => run(() => addToPlaylist(p.id, trackId))}
            >
              {p.name}
            </MenuItem>
          ))}
          {playlistId && (
            <>
              <div className="my-1 h-px bg-line" />
              <MenuItem
                onClick={() =>
                  run(() => removeFromPlaylist(playlistId, trackId))
                }
              >
                <Trash2 size={16} /> Remove from this playlist
              </MenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 truncate rounded-lg px-3 py-2 text-left text-body-m hover:bg-sunken"
    >
      {children}
    </button>
  );
}
