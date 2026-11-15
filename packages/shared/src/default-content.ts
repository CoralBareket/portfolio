import type { SiteContent } from './schemas';

/**
 * Initial site content. Every fact here comes from Coral's CV; nothing is invented.
 * Used to seed Firestore (emulator + first production run) and as a build-time fallback.
 */
export const defaultContent: SiteContent = {
  hero: {
    name: 'Coral Bareket',
    title: 'Software Engineer',
    tagline: 'Curious enough to learn any stack, precise enough to ship it right.',
    location: 'Central Israel',
    chips: ['TypeScript', 'NestJS', 'React', 'PostgreSQL', 'ClickHouse', 'AWS'],
  },
  summary:
    "Software engineer who works across the stack: backend, data, frontend and cloud. I learn whatever a problem needs, quickly, and hold the result to a high bar. Early-stage startup experience means I'm used to owning work end to end, from the first schema to production.",
  skills: [
    { name: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'C#'] },
    { name: 'Backend', items: ['Node.js', 'NestJS', 'ASP.NET Core', 'Express.js', 'REST APIs'] },
    { name: 'Frontend', items: ['React', 'Angular', 'Responsive UI'] },
    {
      name: 'Data',
      items: [
        'PostgreSQL',
        'MS SQL',
        'MongoDB',
        'ClickHouse',
        'DuckDB',
        'ML data pipelines',
        'High-volume data processing',
      ],
    },
    { name: 'Cloud & DevOps', items: ['AWS EC2', 'AWS Batch', 'Docker', 'CI/CD (GitHub Actions)'] },
    {
      name: 'Other',
      items: [
        'Firebase',
        'Webhooks',
        'Event-driven systems',
        'Cron jobs',
        'Git',
        'Unit testing',
        'Performance optimization',
      ],
    },
  ],
  focusAreas: [
    {
      title: 'Backend & APIs',
      description:
        'Scalable backend services with Node.js (NestJS), TypeORM and PostgreSQL, including REST APIs for ML workflows: run orchestration, tracking and results.',
      tags: ['NestJS', 'TypeORM', 'PostgreSQL', 'REST'],
    },
    {
      title: 'Data Pipelines & Analytics',
      description:
        'ML data pipelines and analytics queries with ClickHouse, and high-volume data processing for an ML financial analytics platform.',
      tags: ['ClickHouse', 'ML pipelines', 'Analytics'],
    },
    {
      title: 'Cloud & DevOps',
      description:
        'AWS Batch for distributed processing and async jobs, Docker and AWS EC2 deployments, CI/CD pipelines, and event-driven architecture with Webhooks and EventBridge.',
      tags: ['AWS Batch', 'EC2', 'Docker', 'EventBridge'],
    },
    {
      title: 'Product / Full-Stack Features',
      description:
        'End-to-end features across backend, frontend, data pipelines and deployment, React dashboards for real-time monitoring, and production debugging of performance, memory and distributed failures.',
      tags: ['React', 'Dashboards', 'Debugging'],
    },
  ],
  experience: [
    {
      role: 'Full-Stack Developer',
      company: 'TerriFiX',
      companyDescription: 'ML financial analytics platform',
      period: '2025 – 2026',
      highlight: 'Promoted from intern to full-time developer after contributing to core product features',
      bullets: [
        'Delivered end-to-end features across backend, frontend, data pipelines, and AWS deployment workflows',
        'Built scalable backend services with Node.js (NestJS), TypeORM and PostgreSQL',
        'Designed REST APIs for ML workflows: run orchestration, tracking and results',
        'Used AWS Batch for distributed processing and async job execution',
        'Built ML data pipelines and analytics queries with ClickHouse',
        'Developed React dashboards for real-time monitoring and data visualization',
        'Deployed with Docker and AWS EC2, and maintained CI/CD pipelines',
        'Worked with event-driven architecture (Webhooks, EventBridge)',
        'Debugged production issues: performance, memory and distributed failures',
      ],
    },
  ],
  about: {
    paragraphs: [
      "I'm a software engineer with a B.Sc. in Computer Science from The College of Management. I like problems I haven't solved before: I learn what they need, then build it carefully.",
      "Since 2015 I've volunteered as a medic with Magen David Adom. During my IDF service (2018–2020) I worked as an interviewer.",
    ],
    education: {
      degree: 'B.Sc. Computer Science',
      school: 'The College of Management',
      period: '2022 – 2025',
    },
    service: [
      { role: 'Medic', org: 'Magen David Adom', period: '2015 – present' },
      { role: 'Interviewer', org: 'IDF', period: '2018 – 2020' },
    ],
    languages: [
      { name: 'Hebrew', level: 'Native' },
      { name: 'English', level: 'Fluent' },
    ],
  },
  links: {
    linkedin: 'https://il.linkedin.com/in/coral-bareket-97b886216',
    github: 'https://github.com/CoralBareket',
    email: 'coral.bareket@gmail.com',
  },
  settings: {
    hideProjects: false,
  },
};
