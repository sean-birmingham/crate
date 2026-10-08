"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { renamePlaylist } from "@/lib/actions";

export default function PlaylistTitle({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [value, setValue] = useState(name);
  const [lastName, setLastName] = useState(name);
  const [, startTransition] = useTransition();
  const cancelled = useRef(false);

  // When the saved name changes (after a rename), show it.
  if (name !== lastName) {
    setLastName(name);
    setValue(name);
  }

  function save() {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const next = value.trim();
    if (!next || next === name) {
      setValue(name); // empty or unchanged: put the old name back
      return;
    }
    startTransition(async () => {
      await renamePlaylist(id, next);
    });
  }

  return (
    <label className="group -mx-2 flex items-center gap-3 rounded-lg px-2 hover:bg-sunken/60 focus-within:bg-sunken">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur(); // blurring triggers save()
          if (e.key === "Escape") {
            cancelled.current = true;
            setValue(name);
            e.currentTarget.blur();
          }
        }}
        aria-label="Playlist name"
        maxLength={100}
        className={`min-w-0 flex-1 bg-transparent font-display outline-none ${
          value.length > 18
            ? "text-heading-m md:text-display-l"
            : "text-display-l md:text-display-xl"
        }`}
      />
      <Pencil
        size={22}
        aria-hidden
        className="shrink-0 text-faint can-hover:opacity-0 can-hover:group-hover:opacity-100"
      />
    </label>
  );
}
