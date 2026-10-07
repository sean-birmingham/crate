import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { AlbumWithArtist, Db, PlayableTrack, Track } from "./types";

const LOCAL_DB = path.join(process.cwd(), "data", "db.local.json");
const PUBLIC_DB = path.join(process.cwd(), "data", "db.json");

export async function readDb(): Promise<Db> {
  // Your personal catalog when it exists (your computer), otherwise the public one (the website).
  const file = await access(LOCAL_DB).then(
    () => LOCAL_DB,
    () => PUBLIC_DB
  );
  return JSON.parse(await readFile(file, "utf8"));
}

// Attach what the player needs to show a track: the artist's name and the album cover.
function toPlayable(db: Db, track: Track): PlayableTrack {
  const artist = db.artists.find((a) => a.id === track.artistId);
  const album = db.albums.find((a) => a.id === track.albumId);
  return {
    ...track,
    artistName: artist?.name ?? "Unknown artist",
    cover: album?.cover ?? "/vinyl.svg",
  };
}

const bySide = (a: Track, b: Track) =>
  a.side.localeCompare(b.side, undefined, { numeric: true });

export async function getAlbums(): Promise<AlbumWithArtist[]> {
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

  return {
    ...album,
    artist: db.artists.find((a) => a.id === album.artistId)!,
    tracks: db.tracks
      .filter((t) => t.albumId === id)
      .sort(bySide)
      .map((t) => toPlayable(db, t)),
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
    tracks: db.tracks
      .filter((t) => t.artistId === id)
      .map((t) => toPlayable(db, t)),
  };
}

export async function search(query: string) {
  const db = await readDb();
  const q = query.trim().toLowerCase();
  const has = (text?: string) => !!text && text.toLowerCase().includes(q);
  const artistName = (id: string) => db.artists.find((a) => a.id === id)?.name;
  const albumOf = (id: string) => db.albums.find((a) => a.id === id);

  const tracks = db.tracks
    .filter(
      (t) =>
        has(t.title) ||
        has(artistName(t.artistId)) ||
        has(albumOf(t.albumId)?.title) ||
        has(albumOf(t.albumId)?.genre)
    )
    .map((t) => toPlayable(db, t));

  const albums = db.albums
    .filter((a) => has(a.title) || has(artistName(a.artistId)) || has(a.genre))
    .map((album) => ({
      ...album,
      artist: db.artists.find((a) => a.id === album.artistId)!,
    }));

  const artists = db.artists.filter((a) => has(a.name));

  return { tracks, albums, artists };
}

export async function getGenres() {
  const db = await readDb();
  const counts = new Map<string, number>();
  for (const album of db.albums) {
    if (album.genre)
      counts.set(album.genre, (counts.get(album.genre) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
