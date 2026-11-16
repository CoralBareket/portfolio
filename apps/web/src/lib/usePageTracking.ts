import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { observeSections, trackPageview } from './tracker';

/** Page view on every route change, plus section views on pages that have sections. */
export function usePageTracking({ sections = false }: { sections?: boolean } = {}): void {
  const { pathname } = useLocation();
  useEffect(() => {
    trackPageview(pathname);
    return sections ? observeSections() : undefined;
  }, [pathname, sections]);
}
