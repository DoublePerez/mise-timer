interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  canReset: boolean;
}

function applyFocusRing(el: HTMLButtonElement) {
  el.style.outline = 'var(--outline-width) solid var(--color-muted-strong)';
  el.style.outlineOffset = 'var(--outline-offset)';
}
function clearFocusRing(el: HTMLButtonElement) { el.style.outline = 'none'; }
function pressDown(el: HTMLButtonElement) { el.style.transform = 'scale(0.98)'; }
function pressUp(el: HTMLButtonElement)   { el.style.transform = 'scale(1)'; }

function SecondaryButton({ label, visible, onClick }: { label: string; visible: boolean; onClick: (() => void) | undefined }) {
  return (
    <button
      onClick={visible ? onClick : undefined}
      aria-label={`${label} timer`}
      tabIndex={visible ? 0 : -1}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 400,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '6px var(--space-3)',
        background: 'none',
        border: 'none',
        cursor: visible ? 'pointer' : 'default',
        color: 'var(--color-muted)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: [
          'opacity var(--dur-normal) var(--ease)',
          'color var(--dur-normal) var(--ease)',
          'transform var(--dur-fast) var(--ease)',
        ].join(', '),
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (visible) (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--color-muted)';
        pressUp(btn);
      }}
      onMouseDown={e => { e.preventDefault(); if (visible) pressDown(e.currentTarget as HTMLButtonElement); }}
      onMouseUp={e => pressUp(e.currentTarget as HTMLButtonElement)}
      onFocus={e => { if (visible) applyFocusRing(e.currentTarget as HTMLButtonElement); }}
      onBlur={e => clearFocusRing(e.currentTarget as HTMLButtonElement)}
    >
      {label}
    </button>
  );
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
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '14px 48px',
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
        onMouseDown={e => { e.preventDefault(); pressDown(e.currentTarget as HTMLButtonElement); }}
        onMouseUp={e => pressUp(e.currentTarget as HTMLButtonElement)}
        onMouseLeave={e => pressUp(e.currentTarget as HTMLButtonElement)}
        onFocus={e => applyFocusRing(e.currentTarget as HTMLButtonElement)}
        onBlur={e => clearFocusRing(e.currentTarget as HTMLButtonElement)}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

      <SecondaryButton label="Reset" visible={canReset} onClick={onReset} />
    </div>
  );
}
