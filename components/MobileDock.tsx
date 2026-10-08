"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { READ_ONLY } from "@/lib/config";
import LikeButton from "./LikeButton";
import { NAV_LINKS } from "./nav-links";
import { usePlayer, useProgress } from "./player/PlayerProvider";

export default function MobileDock() {
  return (
    <div className="md:hidden">
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}

function MiniPlayer() {
  const { current, isPlaying, toggle, setNowPlayingOpen } = usePlayer();
  const { time, duration } = useProgress();
  if (!current) return null;

  const percent = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="relative mx-2 mb-2 overflow-hidden rounded-xl bg-deck text-on-deck shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)]">
      <div className="flex items-center gap-3 p-2 pr-3">
        <button
          onClick={() => setNowPlayingOpen(true)}
          aria-label={`Open now playing: ${current.title}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Image
            src={current.cover}
            alt=""
            width={44}
            height={44}
            unoptimized={current.cover.endsWith(".svg")}
            className="size-11 shrink-0 rounded-md object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-body-m font-medium">
              {current.title}
            </span>
            <span className="block truncate text-body-s text-on-deck-soft">
              {current.artistName}
            </span>
          </span>
        </button>
        {!READ_ONLY && (
          <LikeButton
            id={current.id}
            title={current.title}
            idleClass="text-on-deck-soft hover:text-accent"
          />
        )}
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid size-10 place-items-center"
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>
      {/* Thin progress line along the bottom edge */}
      <div
        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-groove"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="grid grid-cols-3 border-t border-line bg-sunken pb-[env(safe-area-inset-bottom)]"
    >
      {NAV_LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-body-s font-medium ${active ? "text-ink" : "text-soft"}`}
          >
            <Icon
              size={22}
              strokeWidth={1.75}
              className={active ? "text-accent" : ""}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
