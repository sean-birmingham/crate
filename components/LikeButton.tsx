"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike, toggleSavedAlbum } from "@/lib/actions";
import { useLibrary } from "./LibraryProvider";

type Props = {
  id: string;
  kind?: "track" | "album";
  title: string;
  size?: number;
  hideUntilHover?: boolean;
  idleClass?: string;
};

export default function LikeButton({
  id,
  kind = "track",
  title,
  size = 20,
  hideUntilHover = false,
  idleClass = "text-faint hover:text-accent",
}: Props) {
  const { likedIds, savedAlbumIds } = useLibrary();
  const isSaved = (kind === "album" ? savedAlbumIds : likedIds).includes(id);
  const [liked, setLiked] = useOptimistic(isSaved);
  const [, startTransition] = useTransition();

  const place = kind === "album" ? "Your crate" : "Liked songs";

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      setLiked(!liked);
      await (kind === "album" ? toggleSavedAlbum(id) : toggleLike(id));
    });
  }

  return (
    <button
      onClick={handleClick}
      onDoubleClick={(e) => e.stopPropagation()}
      aria-pressed={liked}
      aria-label={
        liked ? `Remove ${title} from ${place}` : `Save ${title} to ${place}`
      }
      className={`${liked ? "text-accent" : idleClass} ${
        hideUntilHover && !liked
          ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          : ""
      }`}
    >
      <Heart
        size={size}
        strokeWidth={1.75}
        fill={liked ? "currentColor" : "none"}
      />
    </button>
  );
}
