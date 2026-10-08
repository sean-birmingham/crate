"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readDb, writeDb } from "./db";
import { slugify } from "./format";
import type { Album, Artist, Db } from "./types";

// ---------- helpers ----------

// Add the id to the front of the list, or remove it if it's already there.
const toggled = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];

async function save(db: Db) {
  await writeDb(db);
  revalidatePath("/", "layout"); // refresh every page
}

// ---------- likes and saved albums ----------

export async function toggleLike(trackId: string) {
  const db = await readDb();
  if (!db.tracks.some((t) => t.id === trackId)) return;
  db.likes = toggled(db.likes, trackId);
  await save(db);
}

export async function toggleSavedAlbum(albumId: string) {
  const db = await readDb();
  if (!db.albums.some((a) => a.id === albumId)) return;
  db.savedAlbums = toggled(db.savedAlbums, albumId);
  await save(db);
}

// ---------- playlists ----------

export async function createPlaylist(trackIds: string[] = []) {
  const db = await readDb();
  const id = crypto.randomUUID().slice(0, 8);
  db.playlists.push({
    id,
    name: `My playlist #${db.playlists.length + 1}`,
    trackIds: trackIds.filter((trackId) =>
      db.tracks.some((t) => t.id === trackId)
    ),
  });
  await save(db);
  return id;
}

export async function createPlaylistAndOpen() {
  const id = await createPlaylist();
  redirect(`/playlist/${id}`);
}

export async function renamePlaylist(id: string, newName: string) {
  const name = newName.trim().slice(0, 100);
  const db = await readDb();
  const playlist = db.playlists.find((p) => p.id === id);
  if (!playlist || !name) return;
  playlist.name = name;
  await save(db);
}

export async function deletePlaylist(id: string) {
  const db = await readDb();
  db.playlists = db.playlists.filter((p) => p.id !== id);
  await save(db);
  redirect("/library");
}

export async function addToPlaylist(playlistId: string, trackId: string) {
  const db = await readDb();
  const playlist = db.playlists.find((p) => p.id === playlistId);
  if (
    !playlist ||
    !db.tracks.some((t) => t.id === trackId) ||
    playlist.trackIds.includes(trackId)
  )
    return;
  playlist.trackIds.push(trackId);
  await save(db);
}

export async function removeFromPlaylist(playlistId: string, trackId: string) {
  const db = await readDb();
  const playlist = db.playlists.find((p) => p.id === playlistId);
  if (!playlist) return;
  playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId);
  await save(db);
}

// ---------- uploads ----------

export type UploadState = { error?: string };

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_AUDIO_BYTES = 30 * 1024 * 1024;

// "currents" is taken? Try "currents-2", "currents-3"…
function uniqueId(base: string, taken: { id: string }[]) {
  let id = base;
  for (let n = 2; taken.some((item) => item.id === id); n++)
    id = `${base}-${n}`;
  return id;
}

async function saveUpload(file: File, fileName: string) {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, fileName),
    Buffer.from(await file.arrayBuffer())
  );
  return `/uploads/${fileName}`;
}

export async function uploadTrack(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const text = (key: string) =>
    String(formData.get(key) ?? "")
      .trim()
      .slice(0, 120);
  const audio = formData.get("audio");
  const cover = formData.get("cover");
  const title = text("title");
  const artistName = text("artist");
  const albumTitle = text("album") || title; // no album? file it as a single
  const genre = text("genre");
  const yearInput = Number(text("year"));
  const year =
    yearInput >= 1900 && yearInput <= 2100
      ? yearInput
      : new Date().getFullYear();
  const duration = Math.round(Number(formData.get("duration")) || 0);

  // Check everything before touching the disk. Never trust the browser alone.
  if (!(audio instanceof File) || audio.size === 0)
    return { error: "Choose an audio file." };
  const audioExt = path.extname(audio.name).toLowerCase();
  if (!AUDIO_EXTENSIONS.includes(audioExt))
    return { error: "Use an MP3, WAV, FLAC, OGG, M4A or AAC file." };
  if (audio.size > MAX_AUDIO_BYTES)
    return { error: "That file is over 30 MB." };
  if (!title || !artistName) return { error: "Title and artist are required." };

  const db = await readDb();

  // Reuse the artist if they already exist.
  const existingArtist = db.artists.find(
    (a) => a.name.toLowerCase() === artistName.toLowerCase()
  );
  const artist: Artist = existingArtist ?? {
    id: uniqueId(slugify(artistName), db.artists),
    name: artistName,
  };
  if (!existingArtist) db.artists.push(artist);

  // Reuse the album if this artist already has one with that title.
  const existingAlbum = db.albums.find(
    (a) =>
      a.artistId === artist.id &&
      a.title.toLowerCase() === albumTitle.toLowerCase()
  );
  const album: Album = existingAlbum ?? {
    id: uniqueId(slugify(`${artist.name} ${albumTitle}`), db.albums),
    title: albumTitle,
    artistId: artist.id,
    year,
    cover: "/vinyl.svg",
    ...(genre ? { genre } : {}),
  };
  if (!existingAlbum) db.albums.unshift(album); // newest first on Home

  // Cover: only for new albums, or albums still showing the placeholder.
  if (
    cover instanceof File &&
    cover.size > 0 &&
    (!existingAlbum || album.cover === "/vinyl.svg")
  ) {
    const coverExt = path.extname(cover.name).toLowerCase();
    if (IMAGE_EXTENSIONS.includes(coverExt)) {
      album.cover = await saveUpload(cover, `${album.id}-cover${coverExt}`);
    }
  }

  // Save the audio under a safe name we choose, never the uploaded file's name.
  const trackId = uniqueId(slugify(`${artist.name} ${title}`), db.tracks);
  const src = await saveUpload(audio, `${trackId}${audioExt}`);
  const sideNumber = db.tracks.filter((t) => t.albumId === album.id).length + 1;
  db.tracks.push({
    id: trackId,
    title,
    albumId: album.id,
    artistId: artist.id,
    side: `A${sideNumber}`,
    duration,
    src,
  });

  await save(db);
  redirect(`/album/${album.id}`);
}
