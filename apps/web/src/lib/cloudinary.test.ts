import { describe, expect, it } from 'vitest';
import { cloudinarySrcSet, cloudinaryUrl } from './cloudinary';

const cover = 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/abc.png';

describe('cloudinaryUrl', () => {
  it('adds resize and auto format/quality after /upload/', () => {
    expect(cloudinaryUrl(cover, 960)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_960/v1/portfolio/projects/abc.png',
    );
  });

  it('leaves other URLs alone', () => {
    expect(cloudinaryUrl('https://example.com/upload/a.png', 960)).toBe('https://example.com/upload/a.png');
  });
});

describe('cloudinarySrcSet', () => {
  it('lists one candidate per width', () => {
    expect(cloudinarySrcSet(cover, [640, 1280])).toBe(
      `${cloudinaryUrl(cover, 640)} 640w, ${cloudinaryUrl(cover, 1280)} 1280w`,
    );
  });

  it('is undefined for non-Cloudinary URLs', () => {
    expect(cloudinarySrcSet('https://example.com/a.png', [640])).toBeUndefined();
  });
});
