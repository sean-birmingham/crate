"use client";

import { useEffect, useEffectEvent } from "react";
import { usePlayer } from "./PlayerProvider";

// Keys that belong to whatever has focus: typing in a field, or moving a slider.
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

// Space already presses a focused button, so it shouldn't also play or pause.
function isButton(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest('button, summary, [role="button"], [role^="menuitem"]') !==
      null
  );
}

// Space play/pause · ←/→ seek 5 s · Shift+←/→ previous/next · Shift+↑/↓ volume · M mute · S shuffle · R repeat · Q queue
export default function KeyboardShortcuts() {
  const {
    audioRef,
    current,
    volume,
    queueOpen,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setQueueOpen,
  } = usePlayer();

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (
      e.defaultPrevented ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      isTyping(e.target)
    )
      return;

    const key =
      (e.shiftKey ? "Shift+" : "") +
      (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const changeVolume = (by: number) =>
      setVolume(Math.min(1, Math.max(0, Math.round((volume + by) * 10) / 10)));

    switch (key) {
      case " ":
        if (isButton(e.target)) return;
        if (!e.repeat) toggle();
        break;
      case "ArrowLeft":
        seek(Math.max(0, audio.currentTime - 5));
        break;
      case "ArrowRight":
        seek(audio.currentTime + 5);
        break;
      case "Shift+ArrowLeft":
        if (!e.repeat) previous();
        break;
      case "Shift+ArrowRight":
        if (!e.repeat) next();
        break;
      case "Shift+ArrowUp":
        changeVolume(0.1);
        break;
      case "Shift+ArrowDown":
        changeVolume(-0.1);
        break;
      case "m":
        if (!e.repeat) toggleMute();
        break;
      case "s":
        if (!e.repeat) toggleShuffle();
        break;
      case "r":
        if (!e.repeat) cycleRepeat();
        break;
      case "q":
        if (!e.repeat) setQueueOpen(!queueOpen);
        break;
      default:
        return; // not one of ours: leave it to the browser
    }
    e.preventDefault();
  });

  useEffect(() => {
    const handle = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return null;
}
