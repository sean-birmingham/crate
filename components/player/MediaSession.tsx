"use client";

import { useEffect, useEffectEvent } from "react";
import { usePlayer } from "./PlayerProvider";

// Connects Crate to the system's media controls: keyboard media keys, headphone buttons,
// the Windows and macOS media pop-ups, and the phone lock screen. Renders nothing.
export default function MediaSession() {
  const { audioRef, current, isPlaying, next, previous, seek } = usePlayer();

  // What's playing: title, artist, album and cover.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = current
      ? new MediaMetadata({
          title: current.title,
          artist: current.artistName,
          album: current.albumTitle,
          artwork: [{ src: new URL(current.cover, window.location.href).href }],
        })
      : null;
  }, [current]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = !current
      ? "none"
      : isPlaying
        ? "playing"
        : "paused";
  }, [current, isPlaying]);

  // useEffectEvent always sees the latest next/previous, so the buttons only need wiring up once.
  const onAction = useEffectEvent((details: MediaSessionActionDetails) => {
    const audio = audioRef.current;
    if (!audio) return;
    switch (details.action) {
      case "play":
        audio.play().catch(() => {});
        break;
      case "pause":
        audio.pause();
        break;
      case "previoustrack":
        previous();
        break;
      case "nexttrack":
        next();
        break;
      case "seekbackward":
        seek(Math.max(0, audio.currentTime - (details.seekOffset ?? 10)));
        break;
      case "seekforward":
        seek(audio.currentTime + (details.seekOffset ?? 10));
        break;
      case "seekto":
        if (details.seekTime != null) seek(details.seekTime);
        break;
    }
  });

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const actions: MediaSessionAction[] = [
      "play",
      "pause",
      "previoustrack",
      "nexttrack",
      "seekbackward",
      "seekforward",
      "seekto",
    ];
    const setAll = (handler: MediaSessionActionHandler | null) => {
      for (const action of actions) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch {
          // This browser doesn't support that button.
        }
      }
    };
    setAll((details) => onAction(details));
    return () => setAll(null);
  }, []);

  // The progress bar in the system controls. The system keeps it moving between updates.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !("mediaSession" in navigator)) return;
    const update = () => {
      if (!Number.isFinite(audio.duration)) return;
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          position: Math.min(audio.currentTime, audio.duration),
          playbackRate: audio.playbackRate,
        });
      } catch {
        // Not supported in this browser.
      }
    };
    const events = ["loadedmetadata", "play", "pause", "seeked", "ratechange"];
    events.forEach((e) => audio.addEventListener(e, update));
    return () => events.forEach((e) => audio.removeEventListener(e, update));
  }, [audioRef]);

  return null;
}
