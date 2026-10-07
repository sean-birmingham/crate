"use client";

import { Trash2 } from "lucide-react";
import { deletePlaylist } from "@/lib/actions";

export default function DeletePlaylistButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <button
      aria-label="Delete playlist"
      onClick={() => {
        if (confirm(`Delete “${name}”? This can't be undone.`))
          deletePlaylist(id);
      }}
      className="text-soft hover:text-accent"
    >
      <Trash2 size={24} strokeWidth={1.75} />
    </button>
  );
}
