"use client";

import { useSyncExternalStore } from "react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Re-check the clock once a minute.
function subscribe(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}

// One number that changes when the hour or day changes: hours since Sunday midnight.
function getSnapshot() {
  const now = new Date();
  return now.getDay() * 24 + now.getHours();
}

// The server doesn't know the visitor's time zone.
const getServerSnapshot = () => null;

function momentFor(hour: number) {
  if (hour >= 5 && hour < 12)
    return {
      greeting: "Good morning",
      part: "morning",
      line: "Something to start the day?",
    };
  if (hour >= 12 && hour < 17)
    return {
      greeting: "Good afternoon",
      part: "afternoon",
      line: "Keep the momentum going.",
    };
  if (hour >= 17 && hour < 22)
    return {
      greeting: "Good evening",
      part: "evening",
      line: "Something slow, maybe?",
    };
  return {
    greeting: "Up late?",
    part: "night",
    line: "Quiet hours. Keep it low.",
  };
}

export default function Greeting() {
  const hourOfWeek = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (hourOfWeek === null) {
    // An invisible stand-in of the same size, so the page doesn't jump when the real greeting appears.
    return (
      <header aria-hidden className="invisible">
        <h1 className="font-display text-display-l font-normal italic">
          Good evening
        </h1>
        <p className="mt-1 text-body-m">.</p>
      </header>
    );
  }

  const hour = hourOfWeek % 24;
  const today = Math.floor(hourOfWeek / 24);
  // 1 a.m. on Wednesday still feels like "Tuesday night".
  const day = DAYS[hour < 5 ? (today + 6) % 7 : today];
  const { greeting, part, line } = momentFor(hour);

  return (
    <header>
      <h1 className="font-display text-display-l font-normal italic">
        {greeting}
      </h1>
      <p className="mt-1 text-body-m text-soft">
        {day} {part}. {line}
      </p>
    </header>
  );
}
