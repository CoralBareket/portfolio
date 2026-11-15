import { GithubIcon, LinkedinIcon } from './icons';

type Props = { name: string; location: string; linkedin: string; github: string };

export function Footer({ name, location, linkedin, github }: Props) {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] text-faint">
          <span className="font-sans text-[13px] font-semibold text-text">{name}</span>
          <span className="mx-2">·</span>© {__BUILD_DATE__.slice(0, 4)}
          {location && (
            <>
              <span className="mx-2">·</span>
              {location}
            </>
          )}
        </p>
        <ul className="flex gap-5 font-mono text-[11px] text-muted">
          <li>
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-text"
            >
              <LinkedinIcon size={13} /> LinkedIn
            </a>
          </li>
          <li>
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-text"
            >
              <GithubIcon size={13} /> GitHub
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
