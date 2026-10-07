"use client";

import { createContext, useContext } from "react";
import type { PlaylistSummary } from "@/lib/types";

type Library = {
  likedIds: string[];
  savedAlbumIds: string[];
  playlists: PlaylistSummary[];
};

const LibraryContext = createContext<Library>({
  likedIds: [],
  savedAlbumIds: [],
  playlists: [],
});

export function LibraryProvider({
  children,
  ...library
}: Library & { children: React.ReactNode }) {
  return <LibraryContext value={library}>{children}</LibraryContext>;
}

export function useLibrary() {
  return useContext(LibraryContext);
}
