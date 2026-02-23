interface ModeIndicatorProps {
  label: string;
}

export function ModeIndicator({ label }: ModeIndicatorProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 400,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-muted)',
        lineHeight: 1,
        transition: 'color var(--dur-slow) var(--ease)',
        userSelect: 'none',
      }}
      aria-live="polite"
      aria-label={`Current mode: ${label}`}
    >
      {label}
    </span>
  );
}
