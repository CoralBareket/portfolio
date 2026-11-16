import { MotionConfig } from 'motion/react';
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { ContentProvider, useContent } from '../lib/content';
import { usePageTracking } from '../lib/usePageTracking';
import { visibleSections, type SectionId } from '../lib/site';
import { About } from '../sections/About';
import { Contact } from '../sections/Contact';
import { Experience } from '../sections/Experience';
import { Focus } from '../sections/Focus';
import { Hero } from '../sections/Hero';
import { Projects } from '../sections/Projects';
import { TechStack } from '../sections/TechStack';

const sectionMeta: Record<SectionId, { title: string; Body: () => React.JSX.Element }> = {
  stack: { title: 'Tech stack', Body: TechStack },
  focus: { title: 'Range', Body: Focus },
  experience: { title: 'Experience', Body: Experience },
  projects: { title: 'Projects', Body: Projects },
  about: { title: 'About', Body: About },
  contact: { title: 'Get in touch', Body: Contact },
};

function Home() {
  usePageTracking({ sections: true });
  const { content, projects } = useContent();
  const sections = visibleSections(content.settings.hideProjects);
  const hasProjects = projects.some((p) => p.published);
  const workHref = !content.settings.hideProjects && hasProjects ? '#projects' : '#experience';

  return (
    <MotionConfig reducedMotion="user">
      <Seo content={content} />
      <a
        href="#main"
        className="sr-only z-50 bg-accent px-4 py-2 font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Nav name={content.hero.name} title={content.hero.title} sections={sections} />
      <main id="main">
        <Hero workHref={workHref} />
        {sections.map((s) => {
          const { title, Body } = sectionMeta[s.id];
          return (
            <Section key={s.id} id={s.id} number={s.number} title={title} centered={s.id === 'contact'}>
              <Body />
            </Section>
          );
        })}
      </main>
      <Footer
        name={content.hero.name}
        location={content.hero.location}
        linkedin={content.links.linkedin}
        github={content.links.github}
      />
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
