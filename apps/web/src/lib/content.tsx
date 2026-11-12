import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultContent, type Project, type SiteContent } from '@portfolio/shared';

type ContentState = { content: SiteContent; projects: Project[] };

const ContentContext = createContext<ContentState>({ content: defaultContent, projects: [] });

/**
 * The page is pre-rendered with the build-time content, then refreshed from the
 * (CDN-cached) API so edits from the admin panel show up without a rebuild.
 */
export function ContentProvider({
  initial = { content: defaultContent, projects: [] },
  children,
}: {
  initial?: ContentState;
  children: ReactNode;
}) {
  const [state, setState] = useState<ContentState>(initial);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/content', { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Partial<ContentState>>) : null))
      .then((data) => {
        if (data?.content) setState({ content: data.content, projects: data.projects ?? [] });
      })
      .catch(() => {
        /* keep the pre-rendered content */
      });
    return () => controller.abort();
  }, []);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
