"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import {
  ACCENTS,
  readAccent,
  readPref,
  setAccent,
  setPref,
  subscribe,
  type Accent,
  type ThemePref,
} from "@/lib/theme";

const MODES: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: "system", label: "Auto", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

type Props = {
  placement?: "up" | "down"; // which way the panel opens
  labelClassName?: string; // e.g. hide the word "Appearance" in the narrow sidebar
};

export default function AppearanceMenu({
  placement = "up",
  labelClassName = "",
}: Props) {
  const mode = useSyncExternalStore(
    subscribe,
    readPref,
    (): ThemePref => "system"
  );
  const accent = useSyncExternalStore(
    subscribe,
    readAccent,
    (): Accent => "orange"
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside, or on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Appearance"
        title="Appearance"
        className="flex h-11 w-full items-center justify-center gap-3.5 rounded-[10px] px-3.5 text-body-m font-medium text-soft hover:text-ink lg:justify-start"
      >
        <Palette size={22} strokeWidth={1.75} className="shrink-0" />
        <span className={labelClassName}>Appearance</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance"
          className={`absolute z-30 w-64 rounded-xl border border-line bg-raised p-4 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.35)] ${
            placement === "up"
              ? "bottom-full left-0 mb-2"
              : "right-0 top-full mt-2"
          }`}
        >
          <p className="mb-2 font-mono text-label uppercase text-faint">Mode</p>
          <div
            role="radiogroup"
            aria-label="Color mode"
            className="grid grid-cols-3 gap-1 rounded-lg bg-sunken p-1"
          >
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="radio"
                aria-checked={mode === id}
                onClick={() => setPref(id)}
                className={`flex flex-col items-center gap-1 rounded-md py-2 text-body-s ${
                  mode === id
                    ? "bg-raised text-ink shadow-sm"
                    : "text-soft hover:text-ink"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 font-mono text-label uppercase text-faint">
            Accent
          </p>
          <div
            role="radiogroup"
            aria-label="Accent color"
            className="flex gap-2.5"
          >
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                role="radio"
                aria-checked={accent === a.id}
                aria-label={a.label}
                title={a.label}
                onClick={() => setAccent(a.id)}
                style={{ backgroundColor: a.swatch }}
                className={`size-8 rounded-full ring-offset-2 ring-offset-raised transition-transform hover:scale-110 ${
                  accent === a.id ? "ring-2 ring-ink" : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
