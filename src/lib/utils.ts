import { SECONDS_PER_MINUTE } from './constants';

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const s = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function minutesToSeconds(minutes: number): number {
  return minutes * SECONDS_PER_MINUTE;
}
