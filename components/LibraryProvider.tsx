"use client";

import { createContext, useContext } from "react";

type Library = { likedIds: string[]; savedAlbumIds: string[] };

const LibraryContext = createContext<Library>({
  likedIds: [],
  savedAlbumIds: [],
});

export function LibraryProvider({
  likedIds,
  savedAlbumIds,
  children,
}: Library & { children: React.ReactNode }) {
  return (
    <LibraryContext value={{ likedIds, savedAlbumIds }}>
      {children}
    </LibraryContext>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
