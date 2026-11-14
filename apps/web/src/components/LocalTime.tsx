import { useEffect, useState } from 'react';

const format = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());

/** Current time in Israel. Renders a placeholder on the server so hydration always matches. */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(format());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="label tabular-nums" title="Local time in Israel">
      ISR <span className="text-text">{time ?? '--:--'}</span>
    </span>
  );
}
