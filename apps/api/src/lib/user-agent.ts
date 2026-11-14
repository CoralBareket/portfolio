import { isbot } from 'isbot';

export type ClientInfo = { device: 'mobile' | 'tablet' | 'desktop'; browser: string; os: string };

export const isBot = (ua: string) => !ua || isbot(ua);

/** Coarse, privacy-friendly buckets. Only these three labels are ever stored, never the raw UA. */
export function parseUserAgent(ua: string): ClientInfo {
  const device = /iPad|Tablet|Nexus (7|9|10)|SM-T/i.test(ua)
    ? 'tablet'
    : /Mobi|iPhone|Android/i.test(ua)
      ? 'mobile'
      : 'desktop';

  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /SamsungBrowser/.test(ua)
        ? 'Samsung Internet'
        : /Firefox|FxiOS/.test(ua)
          ? 'Firefox'
          : /Chrome|CriOS/.test(ua)
            ? 'Chrome'
            : /Safari/.test(ua)
              ? 'Safari'
              : 'Other';

  const os = /Windows/.test(ua)
    ? 'Windows'
    : /iPhone|iPad|iPod/.test(ua)
      ? 'iOS'
      : /Android/.test(ua)
        ? 'Android'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /CrOS/.test(ua)
            ? 'ChromeOS'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'Other';

  return { device, browser, os };
}
