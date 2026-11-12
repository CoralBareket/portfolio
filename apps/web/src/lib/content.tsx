import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultContent, type PublicContentResponse } from '@portfolio/shared';

const initialState: PublicContentResponse = { content: defaultContent, projects: [], cvAvailable: false };
const ContentContext = createContext<PublicContentResponse>(initialState);

/**
 * The page is pre-rendered with the build-time content, then refreshed from the
 * (CDN-cached) API so edits from the admin panel show up without a rebuild.
 */
export function ContentProvider({
  initial = initialState,
  children,
}: {
  initial?: PublicContentResponse;
  children: ReactNode;
}) {
  const [state, setState] = useState<PublicContentResponse>(initial);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/content', { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Partial<PublicContentResponse>>) : null))
      .then((data) => {
        if (data?.content)
          setState({
            content: data.content,
            projects: data.projects ?? [],
            cvAvailable: data.cvAvailable ?? false,
          });
      })
      .catch(() => {
        /* keep the pre-rendered content */
      });
    return () => controller.abort();
  }, []);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
