"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchField({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [lastInitial, setLastInitial] = useState(initialQuery);

  // If the address changes from outside (e.g. clicking a genre), show that text in the box.
  if (initialQuery !== lastInitial) {
    setLastInitial(initialQuery);
    if (initialQuery !== query.trim()) setQuery(initialQuery);
  }

  // Update the address 300ms after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.trim();
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    }, 300);
    return () => clearTimeout(timer);
  }, [query, router]);

  return (
    <label className="flex h-14 items-center gap-3 rounded-full bg-sunken px-5 text-soft focus-within:ring-2 focus-within:ring-accent">
      <Search size={20} strokeWidth={1.75} />
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to spin?"
        className="flex-1 bg-transparent text-body-m text-ink outline-none placeholder:text-faint"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
        >
          <X size={18} />
        </button>
      )}
    </label>
  );
}
