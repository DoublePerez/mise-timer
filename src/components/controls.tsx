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
function clearFocusRing(el: HTMLButtonElement) { el.style.outline = 'none'; }
function pressDown(el: HTMLButtonElement) { el.style.transform = 'scale(0.98)'; }
function pressUp(el: HTMLButtonElement)   { el.style.transform = 'scale(1)'; }

export function Controls({ isRunning, onToggle, onReset, canReset }: ControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Fixed gap so Reset slot always exists — no layout shift
        gap: 'var(--space-3)',
      }}
    >
      {/* Start / Pause */}
      <button
        onClick={onToggle}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '10px 28px',
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

      {/* Reset — always in the DOM, invisible when not needed. No layout shift. */}
      <button
        onClick={canReset ? onReset : undefined}
        aria-label="Reset timer"
        tabIndex={canReset ? 0 : -1}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          fontWeight: 400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '6px var(--space-4)',
          background: 'none',
          border: 'none',
          cursor: canReset ? 'pointer' : 'default',
          color: 'var(--color-muted)',
          opacity: canReset ? 1 : 0,
          pointerEvents: canReset ? 'auto' : 'none',
          transition: [
            'opacity var(--dur-normal) var(--ease)',
            'color var(--dur-normal) var(--ease)',
            'transform var(--dur-fast) var(--ease)',
          ].join(', '),
          outline: 'none',
        }}
        onMouseEnter={e => {
          if (canReset) (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.color = 'var(--color-muted)';
          pressUp(btn);
        }}
        onMouseDown={e => { if (canReset) pressDown(e.currentTarget as HTMLButtonElement); }}
        onMouseUp={e => pressUp(e.currentTarget as HTMLButtonElement)}
        onFocus={e => { if (canReset) applyFocusRing(e.currentTarget as HTMLButtonElement); }}
        onBlur={e => clearFocusRing(e.currentTarget as HTMLButtonElement)}
      >
        Reset
      </button>
    </div>
  );
}
