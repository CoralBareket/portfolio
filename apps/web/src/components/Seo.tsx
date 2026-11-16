import { Head } from 'vite-react-ssg';
import type { SiteContent } from '@portfolio/shared';
import { SITE_URL } from '../lib/site';

/** Meta tags, Open Graph and JSON-LD Person schema, baked into the pre-rendered HTML. */
export function Seo({ content }: { content: SiteContent }) {
  const { hero, links, about } = content;
  const title = `${hero.name} · ${hero.title}`;
  const description = `${hero.title} in Israel. ${hero.tagline}`;
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: hero.name,
    jobTitle: hero.title,
    url: SITE_URL,
    sameAs: [links.linkedin, links.github],
    address: { '@type': 'PostalAddress', addressCountry: 'IL' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: about.education.school },
    knowsLanguage: about.languages.map((l) => l.name),
  };

  return (
    <Head>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta property="og:type" content="profile" />
      <meta property="og:site_name" content={hero.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:image" content={`${SITE_URL}/og.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(personLd)}</script>
    </Head>
  );
}
