// Remembers the volume and mute setting in this browser, the same way lib/theme.ts remembers the theme.
// The player reads these with useSyncExternalStore, so the server can render the default without a hydration mismatch.

export const DEFAULT_VOLUME = 0.8;

let volume: number | null = null; // read from localStorage the first time it's needed
let muted: boolean | null = null;
const listeners = new Set<() => void>();

function load(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage is blocked (some private windows)
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage is blocked: the setting still works until the page is closed.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeVolume(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVolume() {
  if (volume === null) {
    const saved = parseFloat(load("volume") ?? "");
    volume = saved >= 0 && saved <= 1 ? saved : DEFAULT_VOLUME;
  }
  return volume;
}

export function getMuted() {
  if (muted === null) muted = load("muted") === "true";
  return muted;
}

export function saveVolume(value: number) {
  volume = value;
  store("volume", String(value));
}

export function saveMuted(value: boolean) {
  muted = value;
  store("muted", String(value));
}
