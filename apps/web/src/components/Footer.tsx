import { Rule } from './Reveal';

const buildDate = new Date(`${__BUILD_DATE__}T00:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function Footer({ name, location }: { name: string; location: string }) {
  return (
    <footer className="mx-auto max-w-[1200px] px-5 sm:px-8">
      <Rule />
      <div className="grid grid-cols-1 gap-8 py-10 text-sm text-muted lg:grid-cols-12 lg:gap-8">
        <div className="space-y-1 lg:col-span-3">
          <p className="text-text">
            © {__BUILD_DATE__.slice(0, 4)} {name}
          </p>
          {location && <p>{location}</p>}
        </div>
        <div className="space-y-1 lg:col-span-5">
          <p>
            Designed and built with React, Hono and Firebase.{' '}
            <a href="https://github.com/CoralBareket/portfolio" className="link text-text">
              Read the source
            </a>
            .
          </p>
          <p>
            Privacy: first-party analytics only. No cookies, no visitor IDs, no IP addresses, no third-party
            trackers. Do-Not-Track is respected.
          </p>
        </div>
        <p className="label leading-relaxed lg:col-span-4 lg:text-right">
          build <span className="text-text">{__BUILD_COMMIT__}</span> · {buildDate}
        </p>
      </div>
    </footer>
  );
}
