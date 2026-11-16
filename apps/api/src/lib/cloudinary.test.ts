import { describe, expect, it } from 'vitest';
import { attachmentUrl, createUploadSignature, isOwnAsset, signParams } from './cloudinary';

describe('cloudinary helpers', () => {
  it('signs params like Cloudinary documents it (sorted, &-joined, + secret, SHA-1)', () => {
    // Example from Cloudinary's "Generating authentication signatures" guide.
    const signature = signParams(
      { eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop', public_id: 'sample_image', timestamp: '1315060510' },
      'abcd',
    );
    expect(signature).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
  });

  it('creates an upload signature restricted to the right folder and formats', () => {
    const sig = createUploadSignature('cv', 1_700_000_000_000);
    expect(sig.uploadUrl).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(sig.fields).toMatchObject({
      folder: 'portfolio-dev/cv',
      allowed_formats: 'pdf',
      timestamp: '1700000000',
      api_key: 'test-key',
    });
    expect(sig.fields.signature).toMatch(/^[0-9a-f]{40}$/);
  });

  it('only accepts assets from our own cloud and folder', () => {
    const url = 'https://res.cloudinary.com/demo-cloud/image/upload/v1/portfolio-dev/cv/abc.pdf';
    expect(isOwnAsset(url, 'portfolio-dev/cv/abc', 'cv')).toBe(true);
    expect(isOwnAsset('https://evil.example/cv.pdf', 'portfolio-dev/cv/abc', 'cv')).toBe(false);
    expect(isOwnAsset(url, 'portfolio-dev/projects/abc', 'cv')).toBe(false);
  });

  it('builds a download URL with a friendly file name', () => {
    expect(
      attachmentUrl(
        'https://res.cloudinary.com/demo-cloud/image/upload/v1/portfolio-dev/cv/abc.pdf',
        'Coral Bareket CV.pdf',
      ),
    ).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/fl_attachment:Coral_Bareket_CV/v1/portfolio-dev/cv/abc.pdf',
    );
  });
});
