/** Polls the Firestore emulator until it answers, so `pnpm dev` can seed right after startup. */
const host = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const deadline = Date.now() + 90_000;

while (Date.now() < deadline) {
  try {
    const res = await fetch(`http://${host}/`);
    if (res.ok) process.exit(0);
  } catch {
    // not up yet
  }
  await new Promise((r) => setTimeout(r, 1000));
}
console.error(`Firestore emulator at ${host} did not start within 90s (is Java 21 installed?)`);
process.exit(1);
