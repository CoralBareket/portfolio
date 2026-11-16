/** Helpers for editing lists as plain text in textareas. */
export const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
export const commaList = (s: string) =>
  s
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
