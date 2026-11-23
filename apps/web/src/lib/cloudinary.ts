/**
 * Cloudinary delivery URL resized to `width` with automatic format (AVIF/WebP) and quality.
 * Any other URL is returned unchanged, so non-Cloudinary covers still work.
 */
export function cloudinaryUrl(url: string, width: number): string {
  if (!url.startsWith('https://res.cloudinary.com/') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

/** `srcset` for a Cloudinary image at the given widths (plain URL elsewhere). */
export function cloudinarySrcSet(url: string, widths: number[]): string | undefined {
  if (cloudinaryUrl(url, 1) === url) return undefined;
  return widths.map((w) => `${cloudinaryUrl(url, w)} ${w}w`).join(', ');
}
