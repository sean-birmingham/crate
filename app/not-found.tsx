import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="font-mono text-label uppercase text-faint">Error 404</p>
      <h1 className="font-display text-display-l">
        This record isn't in the crate
      </h1>
      <Link
        href="/"
        className="text-body-m font-medium text-accent hover:underline"
      >
        Back to Home
      </Link>
    </div>
  );
}
