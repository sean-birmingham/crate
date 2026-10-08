export type ThemePref = "system" | "light" | "dark";
export type Accent = "orange" | "oxblood" | "teal" | "cobalt" | "olive";

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "orange", label: "Orange", swatch: "#D4531C" },
  { id: "oxblood", label: "Oxblood", swatch: "#9B3530" },
  { id: "teal", label: "Teal", swatch: "#2E6E68" },
  { id: "cobalt", label: "Cobalt", swatch: "#2C4C96" },
  { id: "olive", label: "Olive", swatch: "#6E7B3B" },
];

const THEME_KEY = "theme";
const ACCENT_KEY = "accent";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function readPref(): ThemePref {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system"; // storage can be blocked, e.g. in some private windows
  }
}

export function readAccent(): Accent {
  try {
    const value = localStorage.getItem(ACCENT_KEY);
    return ACCENTS.some((a) => a.id === value) ? (value as Accent) : "orange";
  } catch {
    return "orange";
  }
}

export function applyTheme(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && darkQuery().matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function applyAccent(accent: Accent) {
  if (accent === "orange") delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = accent;
}

export function setPref(pref: ThemePref) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {}
  applyTheme(pref);
  window.dispatchEvent(new Event("themechange"));
}

export function setAccent(accent: Accent) {
  try {
    if (accent === "orange") localStorage.removeItem(ACCENT_KEY);
    else localStorage.setItem(ACCENT_KEY, accent);
  } catch {}
  applyAccent(accent);
  window.dispatchEvent(new Event("themechange"));
}

// Let React know when the theme changes here, in another tab, or in the OS.
export function subscribe(callback: () => void) {
  const refresh = () => {
    applyTheme(readPref());
    applyAccent(readAccent());
    callback();
  };
  const query = darkQuery();
  query.addEventListener("change", refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("themechange", callback);
  return () => {
    query.removeEventListener("change", refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("themechange", callback);
  };
}

// Runs in <head> before the page is shown, so there's no flash of the wrong theme.
export const themeScript = `(function(){try{var d=document.documentElement;var p=localStorage.getItem('${THEME_KEY}');var dark=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);d.dataset.theme=dark?'dark':'light';var a=localStorage.getItem('${ACCENT_KEY}');if(a)d.dataset.accent=a}catch(e){}})()`;
