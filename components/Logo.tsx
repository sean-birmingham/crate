import Link from "next/link";

export default function Logo({
  nameClassName = "",
}: {
  nameClassName?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Crate home"
      className="flex items-center gap-2.5"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-deck ring-1 ring-line">
        <span className="size-2.5 rounded-full bg-accent" />
      </span>
      <span className={`font-display text-heading-m ${nameClassName}`}>
        Crate
      </span>
    </Link>
  );
}
