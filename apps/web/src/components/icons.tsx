import type { SVGProps } from 'react';
import { siGithub } from 'simple-icons';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function GithubIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d={siGithub.path} />
    </svg>
  );
}
