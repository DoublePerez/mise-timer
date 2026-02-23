import { formatTime } from '@/lib/utils';

interface TimerDisplayProps {
  timeRemaining: number;
}

export function TimerDisplay({ timeRemaining }: TimerDisplayProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-timer)',
        lineHeight: 'var(--leading-timer)',
        letterSpacing: 'var(--tracking-timer)',
        fontWeight: 400,
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        color: 'var(--color-fg)',
        userSelect: 'none',
      }}
      aria-live="off"
      aria-label={`Timer: ${formatTime(timeRemaining)}`}
    >
      {formatTime(timeRemaining)}
    </div>
  );
}
