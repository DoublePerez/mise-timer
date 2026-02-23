interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  canReset: boolean;
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
        onMouseDown={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
        }}
        onMouseUp={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        onFocus={e => {
          (e.currentTarget as HTMLButtonElement).style.outline = '2px solid var(--color-accent)';
          (e.currentTarget as HTMLButtonElement).style.outlineOffset = '3px';
        }}
        onBlur={e => {
          (e.currentTarget as HTMLButtonElement).style.outline = 'none';
        }}
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
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
          onFocus={e => {
            (e.currentTarget as HTMLButtonElement).style.outline = '2px solid var(--color-accent)';
            (e.currentTarget as HTMLButtonElement).style.outlineOffset = '3px';
            (e.currentTarget as HTMLButtonElement).style.borderRadius = 'var(--radius-sm)';
          }}
          onBlur={e => {
            (e.currentTarget as HTMLButtonElement).style.outline = 'none';
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}
