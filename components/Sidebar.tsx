"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, Archive, Upload } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your crate", icon: Archive },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-7 overflow-y-auto bg-sunken px-4 py-7">
      <Link href="/" className="flex items-center gap-2.5 px-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-deck">
          <span className="size-2.5 rounded-full bg-accent" />
        </span>
        <span className="font-display text-heading-m">Crate</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-11 items-center gap-3.5 rounded-[10px] px-3.5 text-body-m font-medium ${
                active ? "bg-paper text-ink" : "text-soft hover:text-ink"
              }`}
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

      <section className="flex flex-col gap-2 px-2.5">
        <h2 className="font-mono text-label uppercase text-faint">
          Your crate
        </h2>
        <p className="text-body-s text-faint">
          Your playlists will show up here.
        </p>
      </section>

      <Link
        href="/upload"
        className="mt-auto flex h-11 items-center gap-3.5 px-3.5 text-body-m font-medium text-soft hover:text-ink"
      >
        <Upload size={22} strokeWidth={1.75} />
        Upload music
      </Link>
    </aside>
  );
}
