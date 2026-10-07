import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { Db } from "./types";

const LOCAL_DB = path.join(process.cwd(), "data", "db.local.json");
const PUBLIC_DB = path.join(process.cwd(), "data", "db.json");

export async function readDb(): Promise<Db> {
  const file = await access(LOCAL_DB).then(
    () => LOCAL_DB,
    () => PUBLIC_DB
  );
  return JSON.parse(await readFile(file, "utf8"));
}

export async function getAlbums() {
  const db = await readDb();
  return db.albums.map((album) => ({
    ...album,
    artist: db.artists.find((a) => a.id === album.artistId)!,
  }));
}

export async function getAlbum(id: string) {
  const db = await readDb();
  const album = db.albums.find((a) => a.id === id);
  if (!album) return null;

  const tracks = db.tracks
    .filter((t) => t.albumId === album.id)
    .sort((a, b) => a.side.localeCompare(b.side, undefined, { numeric: true }));

  return {
    ...album,
    artist: db.artists.find((a) => a.id === album.artistId)!,
    tracks,
  };
}

export async function getArtist(id: string) {
  const db = await readDb();
  const artist = db.artists.find((a) => a.id === id);
  if (!artist) return null;

  return {
    ...artist,
    albums: db.albums
      .filter((a) => a.artistId === id)
      .map((album) => ({ ...album, artist })),
    tracks: db.tracks.filter((t) => t.artistId === id),
  };
}
