interface Option<T> {
  value: T;
  label: string;   // display text
}

interface TimeSelectorProps<T extends string | number> {
  label: string;
  options: readonly Option<T>[];
  selected: T;
  onChange: (value: T) => void;
  unit?: string;   // e.g. "min" — omit for label-only options
  disabled?: boolean;
}

export function TimeSelector<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  unit,
  disabled = false,
}: TimeSelectorProps<T>) {
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
      {/* Section label */}
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
          border: 'var(--border-width) solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface)',
          padding: 'var(--inset-pill)',
          gap: 'var(--inset-pill)',
        }}
        role="group"
        aria-label={`${label} selection`}
      >
        {options.map(opt => {
          const isActive = opt.value === selected;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              aria-pressed={isActive}
              aria-label={unit ? `${opt.label} ${unit}` : opt.label}
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
                minWidth: 'var(--min-segment-width)',
                textAlign: 'center',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
              }}
              onMouseLeave={e => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
              }}
              onFocus={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.outline = 'var(--outline-width) solid var(--color-accent)';
                btn.style.outlineOffset = 'var(--outline-offset)';
              }}
              onBlur={e => {
                (e.currentTarget as HTMLButtonElement).style.outline = 'none';
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Unit label — only rendered when provided */}
      {unit && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-muted)',
            letterSpacing: 'var(--tracking)',
            lineHeight: 1,
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}
