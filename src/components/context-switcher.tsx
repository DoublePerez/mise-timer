import type { TimerContext, WorkMode, CookMode } from '@/lib/types';
import { WORK_MODES, COOK_MODES, WORK_MODE_CONFIGS, COOK_MODE_CONFIGS } from '@/lib/constants';

interface ContextSwitcherProps {
  context: TimerContext;
  workMode: WorkMode;
  cookMode: CookMode;
  onContextChange: (ctx: TimerContext) => void;
  onWorkModeChange: (mode: WorkMode) => void;
  onCookModeChange: (mode: CookMode) => void;
  disabled?: boolean;
}

// Reusable pill-tab button
function TabButton({
  label,
  isActive,
  onClick,
  disabled,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      disabled={disabled}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: isActive ? 500 : 400,
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
        if (!isActive && !disabled)
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
      {label}
    </button>
  );
}

// A pill-shaped segmented control wrapping a row of TabButtons
function SegmentGroup({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: 'var(--border-width) solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-surface)',
        padding: 'var(--inset-pill)',
        gap: 'var(--inset-pill)',
      }}
    >
      {children}
    </div>
  );
}

export function ContextSwitcher({
  context,
  workMode,
  cookMode,
  onContextChange,
  onWorkModeChange,
  onCookModeChange,
  disabled = false,
}: ContextSwitcherProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'opacity var(--dur-normal) var(--ease)',
      }}
    >
      {/* Top-level context: Work / Cook */}
      <SegmentGroup ariaLabel="Timer context">
        <TabButton
          label="Work"
          isActive={context === 'work'}
          onClick={() => onContextChange('work')}
          disabled={disabled}
        />
        <TabButton
          label="Cook"
          isActive={context === 'cook'}
          onClick={() => onContextChange('cook')}
          disabled={disabled}
        />
      </SegmentGroup>

      {/* Sub-mode row — changes based on active context */}
      {context === 'work' ? (
        <SegmentGroup ariaLabel="Work mode">
          {WORK_MODES.map(mode => (
            <TabButton
              key={mode}
              label={WORK_MODE_CONFIGS[mode].label}
              isActive={workMode === mode}
              onClick={() => onWorkModeChange(mode)}
              disabled={disabled}
            />
          ))}
        </SegmentGroup>
      ) : (
        <SegmentGroup ariaLabel="Cook mode">
          {COOK_MODES.map(mode => (
            <TabButton
              key={mode}
              label={COOK_MODE_CONFIGS[mode].label}
              isActive={cookMode === mode}
              onClick={() => onCookModeChange(mode)}
              disabled={disabled}
            />
          ))}
        </SegmentGroup>
      )}
    </div>
  );
}
