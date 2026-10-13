const KEY = "recent-albums";
const MAX = 8;
const NONE: string[] = [];

let recent: string[] | null = null;
const listeners = new Set<() => void>();

export function subscribeRecent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRecent() {
  if (recent === null) {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      recent = Array.isArray(saved)
        ? saved.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      recent = []; // storage blocked, or the saved value was broken
    }
  }
  return recent;
}

export function getRecentOnServer() {
  return NONE;
}

export function rememberAlbum(albumId: string) {
  const list = getRecent();
  if (list[0] === albumId) return;
  recent = [albumId, ...list.filter((id) => id !== albumId)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(recent));
  } catch {
    // ignore localStorage errors
  }
  listeners.forEach((listener) => listener());
}
