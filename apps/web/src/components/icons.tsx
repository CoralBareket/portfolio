import type { SVGProps } from 'react';
import {
  siAngular,
  siClickhouse,
  siDocker,
  siDotnet,
  siDuckdb,
  siExpress,
  siFirebase,
  siGit,
  siGithub,
  siGithubactions,
  siJavascript,
  siMongodb,
  siNestjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';
import {
  Braces,
  Clock,
  Database,
  FlaskConical,
  Gauge,
  MonitorSmartphone,
  Webhook,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Brand({ icon, size = 16, ...props }: IconProps & { icon: SimpleIcon }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d={icon.path} />
    </svg>
  );
}

export const GithubIcon = (props: IconProps) => <Brand icon={siGithub} {...props} />;

export function LinkedinIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.8c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21H9V9Z" />
    </svg>
  );
}

const brandIcons: Record<string, SimpleIcon> = {
  JavaScript: siJavascript,
  TypeScript: siTypescript,
  Python: siPython,
  'Node.js': siNodedotjs,
  NestJS: siNestjs,
  'ASP.NET Core': siDotnet,
  'Express.js': siExpress,
  React: siReact,
  Angular: siAngular,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  ClickHouse: siClickhouse,
  DuckDB: siDuckdb,
  Docker: siDocker,
  'CI/CD (GitHub Actions)': siGithubactions,
  Firebase: siFirebase,
  Git: siGit,
};

const genericIcons: Record<string, LucideIcon> = {
  'REST APIs': Braces,
  'Responsive UI': MonitorSmartphone,
  'ML data pipelines': Workflow,
  'High-volume data processing': Database,
  Webhooks: Webhook,
  'Event-driven systems': Zap,
  'Cron jobs': Clock,
  'Unit testing': FlaskConical,
  'Performance optimization': Gauge,
};

/** Monograms for technologies without a freely usable logo. */
const monograms: Record<string, string> = {
  'C#': 'C#',
  'MS SQL': 'SQL',
  'AWS EC2': 'AWS',
  'AWS Batch': 'AWS',
};

export function TechIcon({ name, size = 16 }: { name: string; size?: number }) {
  const brand = brandIcons[name];
  if (brand) return <Brand icon={brand} size={size} />;
  const Generic = genericIcons[name];
  if (Generic) return <Generic size={size} aria-hidden="true" strokeWidth={1.75} />;
  const mono = monograms[name] ?? name.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-grid place-items-center font-mono text-[9px] leading-none font-bold"
      style={{ width: size, height: size }}
    >
      {mono}
    </span>
  );
}
