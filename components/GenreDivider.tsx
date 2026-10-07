import Link from "next/link";

const COLORS = [
  { bg: "bg-teal", text: "text-on-deck" },
  { bg: "bg-oxblood", text: "text-on-deck" },
  { bg: "bg-cobalt", text: "text-on-deck" },
  { bg: "bg-mustard", text: "text-ink" },
  { bg: "bg-olive", text: "text-on-deck" },
  { bg: "bg-blush", text: "text-ink" },
  { bg: "bg-deck", text: "text-on-deck" },
  { bg: "bg-accent", text: "text-on-deck" },
];

type Props = { name: string; count: number; index: number };

export default function GenreDivider({ name, count, index }: Props) {
  const { bg, text } = COLORS[index % COLORS.length];

  return (
    <Link
      href={`/search?q=${encodeURIComponent(name)}`}
      className="relative block pt-4 transition-transform duration-200 hover:-translate-y-1.5"
    >
      <span className={`absolute left-4 top-0 h-6 w-24 rounded-t-xl ${bg}`} />
      <span
        className={`relative flex h-32 flex-col justify-between rounded-xl p-4 ${bg} ${text}`}
      >
        <span className="font-mono text-body-s opacity-75">
          {count} {count === 1 ? "record" : "records"}
        </span>
        <span className="font-display text-heading-m">{name}</span>
      </span>
    </Link>
  );
}
