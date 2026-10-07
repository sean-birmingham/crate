"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readDb, writeDb } from "./db";
import type { Db } from "./types";

const toggled = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];

async function save(db: Db) {
  await writeDb(db);
  revalidatePath("/", "layout");
}

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

// For the sidebar's + button: create, then go straight to the new playlist.
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
