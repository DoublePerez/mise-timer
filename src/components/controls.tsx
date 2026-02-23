interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  canReset: boolean;
}

function applyFocusRing(el: HTMLButtonElement) {
  el.style.outline = 'var(--outline-width) solid var(--color-accent)';
  el.style.outlineOffset = 'var(--outline-offset)';
}

function clearFocusRing(el: HTMLButtonElement) {
  el.style.outline = 'none';
}

function pressDown(el: HTMLButtonElement) {
  el.style.transform = 'scale(0.98)';
}

function pressUp(el: HTMLButtonElement) {
  el.style.transform = 'scale(1)';
}

export function Controls({ isRunning, onToggle, onReset, canReset }: ControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      {/* Start / Pause */}
      <button
        onClick={onToggle}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-base)',
          fontWeight: 500,
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          padding: 'var(--space-3) var(--space-8)',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          cursor: 'pointer',
          background: isRunning ? 'var(--color-surface-raised)' : 'var(--color-accent)',
          color: isRunning ? 'var(--color-fg)' : 'var(--color-bg)',
          transition: [
            'background var(--dur-normal) var(--ease)',
            'color var(--dur-normal) var(--ease)',
            'transform var(--dur-fast) var(--ease)',
          ].join(', '),
          outline: 'none',
        }}
        onMouseDown={e => pressDown(e.currentTarget as HTMLButtonElement)}
        onMouseUp={e => pressUp(e.currentTarget as HTMLButtonElement)}
        onMouseLeave={e => pressUp(e.currentTarget as HTMLButtonElement)}
        onFocus={e => applyFocusRing(e.currentTarget as HTMLButtonElement)}
        onBlur={e => clearFocusRing(e.currentTarget as HTMLButtonElement)}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

      {/* Reset — ghost, only visible when relevant */}
      {canReset && (
        <button
          onClick={onReset}
          aria-label="Reset timer"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            fontWeight: 400,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            padding: 'var(--space-2) var(--space-4)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-muted)',
            transition: [
              'color var(--dur-normal) var(--ease)',
              'transform var(--dur-fast) var(--ease)',
            ].join(', '),
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.color = 'var(--color-muted)';
            pressUp(btn);
          }}
          onMouseDown={e => pressDown(e.currentTarget as HTMLButtonElement)}
          onMouseUp={e => pressUp(e.currentTarget as HTMLButtonElement)}
          onFocus={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            applyFocusRing(btn);
            btn.style.borderRadius = 'var(--radius-sm)';
          }}
          onBlur={e => clearFocusRing(e.currentTarget as HTMLButtonElement)}
        >
          Reset
        </button>
      )}
    </div>
  );
}
