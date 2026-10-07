"use server";

import { revalidatePath } from "next/cache";
import { readDb, writeDb } from "./db";

// Add the id to the front of the list, or remove it if it's already there.
const toggled = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];

export async function toggleLike(trackId: string) {
  const db = await readDb();
  if (!db.tracks.some((t) => t.id === trackId)) return;
  db.likes = toggled(db.likes, trackId);
  await writeDb(db);
  revalidatePath("/", "layout");
}

export async function toggleSavedAlbum(albumId: string) {
  const db = await readDb();
  if (!db.albums.some((a) => a.id === albumId)) return;
  db.savedAlbums = toggled(db.savedAlbums, albumId);
  await writeDb(db);
  revalidatePath("/", "layout");
}
