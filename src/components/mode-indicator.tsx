import type { Mode } from '@/lib/types';

interface ModeIndicatorProps {
  currentMode: Mode;
}

export function ModeIndicator({ currentMode }: ModeIndicatorProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 400,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--color-accent)',
        lineHeight: 1,
        transition: 'color var(--dur-normal) var(--ease)',
        userSelect: 'none',
      }}
      aria-live="polite"
      aria-label={`Current mode: ${currentMode}`}
    >
      {currentMode === 'work' ? 'Work' : 'Break'}
    </span>
  );
}
