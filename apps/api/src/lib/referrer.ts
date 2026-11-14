const KNOWN: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)github\.com$/, 'GitHub'],
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)(facebook\.com|fb\.me)$/, 'Facebook'],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, 'X / Twitter'],
  [/(^|\.)whatsapp\.(com|net)$|^wa\.me$/, 'WhatsApp'],
];

/** Turns a referrer URL into a source name: a known site, the bare hostname, or "Direct". */
export function classifyReferrer(referrer: string, ownHost?: string): string {
  if (!referrer) return 'Direct';
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'Direct';
  }
  if (!host || (ownHost && host === ownHost.toLowerCase().replace(/^www\./, ''))) return 'Direct';
  for (const [pattern, name] of KNOWN) if (pattern.test(host)) return name;
  return host.slice(0, 60);
}

/** Normalizes utm_source values ("LinkedIn", "linkedin ") to one bucket name. */
export const normalizeUtm = (source: string) =>
  source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40);
