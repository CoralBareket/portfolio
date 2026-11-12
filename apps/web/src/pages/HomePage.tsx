import { MotionConfig } from 'motion/react';
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { ContentProvider, useContent } from '../lib/content';
import { visibleSections, type SectionId } from '../lib/site';
import { About } from '../sections/About';
import { Contact } from '../sections/Contact';
import { Experience } from '../sections/Experience';
import { Focus } from '../sections/Focus';
import { Hero } from '../sections/Hero';
import { Projects } from '../sections/Projects';
import { TechStack } from '../sections/TechStack';

const sectionMeta: Record<SectionId, { title: string; intro?: string; Body: () => React.JSX.Element }> = {
  stack: { title: 'Tech Stack', intro: 'The languages, frameworks and tools I work with.', Body: TechStack },
  focus: { title: 'Engineering Focus', intro: 'Where I spend most of my engineering time.', Body: Focus },
  experience: { title: 'Experience', Body: Experience },
  projects: { title: 'Projects', Body: Projects },
  about: { title: 'About', Body: About },
  contact: { title: 'Get in touch', Body: Contact },
};

function Home() {
  const { content, projects } = useContent();
  const sections = visibleSections(content.settings.hideProjects);
  const hasProjects = projects.some((p) => p.published);
  const workHref = !content.settings.hideProjects && hasProjects ? '#projects' : '#experience';

  return (
    <MotionConfig reducedMotion="user">
      <Seo content={content} />
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-semibold text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Nav sections={sections} />
      <main id="main">
        <Hero workHref={workHref} />
        {sections.map((s) => {
          const { title, intro, Body } = sectionMeta[s.id];
          return (
            <Section key={s.id} id={s.id} number={s.number} slug={s.slug} title={title} intro={intro}>
              <Body />
            </Section>
          );
        })}
      </main>
      <Footer name={content.hero.name} />
    </MotionConfig>
  );
}

export function HomePage() {
  return (
    <ContentProvider>
      <Home />
    </ContentProvider>
  );
}
