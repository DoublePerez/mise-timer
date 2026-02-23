interface TimeSelectorProps {
  label: string;
  options: readonly number[];
  selected: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TimeSelector({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}: TimeSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'opacity var(--dur-normal) var(--ease)',
      }}
    >
      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          fontWeight: 400,
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          lineHeight: 1,
        }}
      >
        {label}
      </span>

      {/* Segmented control */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface)',
          padding: '2px',
          gap: '2px',
        }}
        role="group"
        aria-label={`${label} duration`}
      >
        {options.map(option => {
          const isActive = option === selected;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              aria-pressed={isActive}
              aria-label={`${option} minutes`}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 500 : 400,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 'var(--tracking)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: disabled ? 'default' : 'pointer',
                background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                color: isActive ? 'var(--color-fg)' : 'var(--color-muted)',
                transition: [
                  'background var(--dur-fast) var(--ease)',
                  'color var(--dur-fast) var(--ease)',
                ].join(', '),
                lineHeight: 1,
                whiteSpace: 'nowrap',
                minWidth: '32px',
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
                }
              }}
              onFocus={e => {
                (e.currentTarget as HTMLButtonElement).style.outline = '2px solid var(--color-accent)';
                (e.currentTarget as HTMLButtonElement).style.outlineOffset = '2px';
              }}
              onBlur={e => {
                (e.currentTarget as HTMLButtonElement).style.outline = 'none';
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Unit label */}
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-muted)',
          letterSpacing: 'var(--tracking)',
          lineHeight: 1,
        }}
      >
        min
      </span>
    </div>
  );
}
