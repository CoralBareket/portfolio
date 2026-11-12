import type { User } from 'firebase/auth';
import type { ApiError, UploadSignature } from '@portfolio/shared';

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError | null,
  ) {
    super(body?.error.message ?? `Request failed (${status})`);
  }
}

/** Calls the admin API with a fresh Firebase ID token. */
export async function adminFetch<T>(user: User, path: string, init: RequestInit = {}): Promise<T> {
  const token = await user.getIdToken();
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as T | ApiError | null;
  if (!res.ok) throw new ApiRequestError(res.status, body as ApiError | null);
  return body as T;
}

/** Explains validation errors in plain words for the admin forms. */
export function describeError(err: unknown): string {
  if (err instanceof ApiRequestError) {
    const details = err.body?.error.details as { path: string; message: string }[] | undefined;
    if (details?.length) return details.map((d) => `${d.path || 'form'}: ${d.message}`).join(' · ');
    return err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

export type UploadResult = { url: string; publicId: string; fileName: string };

/** Signed direct upload: the API signs, the browser sends the file straight to Cloudinary. */
export async function uploadFile(user: User, kind: 'image' | 'cv', file: File): Promise<UploadResult> {
  const sig = await adminFetch<UploadSignature>(user, '/uploads/sign', {
    method: 'POST',
    body: JSON.stringify({ kind }),
  });
  const form = new FormData();
  for (const [k, v] of Object.entries(sig.fields)) form.append(k, v);
  form.append('file', file);
  const res = await fetch(sig.uploadUrl, { method: 'POST', body: form });
  const data = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message: string } };
  if (!res.ok || !data.secure_url || !data.public_id) throw new Error(data.error?.message ?? 'Upload failed');
  return { url: data.secure_url, publicId: data.public_id, fileName: file.name };
}
