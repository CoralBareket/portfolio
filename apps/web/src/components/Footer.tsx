export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <p className="font-mono">
          © {new Date().getFullYear()} {name} · Built with React, Hono &amp; Firebase
        </p>
        <p className="max-w-md sm:text-right">
          Privacy: this site uses its own first-party analytics. No cookies, no IP addresses, no location, no
          third-party trackers, and Do-Not-Track is respected.
        </p>
      </div>
    </footer>
  );
}
