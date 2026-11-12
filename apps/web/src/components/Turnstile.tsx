import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/** Cloudflare's documented always-pass test key, used when no real key is configured (dev). */
const TEST_SITE_KEY = '1x00000000000000000000AA';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

/** Loads the CAPTCHA script only when the form scrolls near the viewport, to keep the page fast. */
export const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string) => void }>(function Turnstile(
  { onToken },
  ref,
) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      onTokenRef.current('');
    },
  }));

  useEffect(() => {
    const el = container.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        loadScript()
          .then(() => {
            if (cancelled || !window.turnstile || widgetId.current) return;
            widgetId.current = window.turnstile.render(el, {
              sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || TEST_SITE_KEY,
              theme: 'dark',
              callback: (token: string) => onTokenRef.current(token),
              'expired-callback': () => onTokenRef.current(''),
              'error-callback': () => onTokenRef.current(''),
            });
          })
          .catch(() => onTokenRef.current(''));
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  return <div ref={container} className="min-h-[65px]" />;
});
