import { access, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  Album,
  AlbumWithArtist,
  Db,
  PlayableTrack,
  Track,
  Playlist,
  PlaylistSummary,
  TopResult,
} from "./types";

const LOCAL_DB = path.join(process.cwd(), "data", "db.local.json");
const PUBLIC_DB = path.join(process.cwd(), "data", "db.json");

// Your personal catalog when it exists (your computer), otherwise the public one.
async function dbFile() {
  return access(LOCAL_DB).then(
    () => LOCAL_DB,
    () => PUBLIC_DB
  );
}

export async function readDb(): Promise<Db> {
  const data = JSON.parse(await readFile(await dbFile(), "utf8"));
  return { playlists: [], likes: [], savedAlbums: [], ...data };
}

export async function writeDb(db: Db) {
  const file = await dbFile();
  // Write to a temporary file first, then swap it in, so a crash can't leave a half-written db.
  await writeFile(`${file}.tmp`, JSON.stringify(db, null, 2));
  await rename(`${file}.tmp`, file);
}

// Attach what the player needs to show a track: the artist's name and the album cover.
function toPlayable(db: Db, track: Track): PlayableTrack {
  const artist = db.artists.find((a) => a.id === track.artistId);
  const album = db.albums.find((a) => a.id === track.albumId);
  return {
    ...track,
    artistName: artist?.name ?? "Unknown artist",
    albumTitle: album?.title ?? "",
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

  // The single best match for the Top result card:
  // exact > starts with > contains. Ties: artist, then album, then song, then genre.
  const rank = (text?: string) => {
    const t = text?.toLowerCase();
    if (!t) return 0;
    return t === q ? 3 : t.startsWith(q) ? 2 : t.includes(q) ? 1 : 0;
  };
  const genreNames = [
    ...new Set(db.albums.map((a) => a.genre).filter((g): g is string => !!g)),
  ];
  const candidates: { score: number; result: TopResult }[] = [
    ...artists.map((artist) => ({
      score: rank(artist.name),
      result: { kind: "artist", artist } as const,
    })),
    ...albums.map((album) => ({
      score: rank(album.title),
      result: { kind: "album", album } as const,
    })),
    ...tracks.map((track) => ({
      score: rank(track.title),
      result: { kind: "track", track } as const,
    })),
    ...genreNames.map((name) => ({
      score: rank(name),
      result: {
        kind: "genre",
        name,
        albumCount: db.albums.filter((a) => a.genre === name).length,
      } as const,
    })),
  ];
  const top =
    candidates.filter((c) => c.score > 0).sort((a, b) => b.score - a.score)[0]
      ?.result ?? null;

  return { tracks, albums, artists, top };
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

export async function getLikedTracks() {
  const db = await readDb();
  return db.likes
    .map((id) => db.tracks.find((t) => t.id === id))
    .filter((t): t is Track => t !== undefined)
    .map((t) => toPlayable(db, t));
}

export async function getLibrary() {
  const db = await readDb();
  const savedAlbums = db.savedAlbums
    .map((id) => db.albums.find((a) => a.id === id))
    .filter((a): a is Album => a !== undefined)
    .map((album) => ({
      ...album,
      artist: db.artists.find((a) => a.id === album.artistId)!,
    }));

  return {
    likedIds: db.likes,
    savedAlbums,
    playlists: db.playlists.map((p) => summarize(db, p)),
  };
}

// Up to 4 different album covers from a list of track ids.
function coversFor(db: Db, trackIds: string[]) {
  const covers = trackIds
    .map((id) => db.tracks.find((t) => t.id === id))
    .map((t) => db.albums.find((a) => a.id === t?.albumId)?.cover)
    .filter((c): c is string => !!c);
  return [...new Set(covers)].slice(0, 4);
}

function summarize(db: Db, playlist: Playlist): PlaylistSummary {
  return {
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.trackIds.length,
    covers: coversFor(db, playlist.trackIds),
  };
}

export async function getPlaylist(id: string) {
  const db = await readDb();
  const playlist = db.playlists.find((p) => p.id === id);
  if (!playlist) return null;

  const tracks = playlist.trackIds
    .map((trackId) => db.tracks.find((t) => t.id === trackId))
    .filter((t): t is Track => t !== undefined)
    .map((t) => toPlayable(db, t));

  return { ...summarize(db, playlist), tracks };
}
