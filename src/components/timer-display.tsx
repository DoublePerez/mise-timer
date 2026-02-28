import { formatTime } from '@/lib/utils';

interface TimerDisplayProps {
  timeRemaining: number;
  isPaused?: boolean;
}

export function TimerDisplay({ timeRemaining, isPaused = false }: TimerDisplayProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-timer)',
        lineHeight: 'var(--leading-timer)',
        letterSpacing: 'var(--tracking-timer)',
        fontWeight: 400,
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        color: 'var(--color-fg)',
        opacity: isPaused ? 0.35 : 1,
        transition: 'opacity var(--dur-normal) var(--ease)',
        userSelect: 'none',
      }}
      aria-live="off"
      aria-label={`Timer: ${formatTime(timeRemaining)}`}
    >
      {formatTime(timeRemaining)}
    </div>
  );
}
