import type { Phase } from '@/lib/types';
import { formatTime } from '@/lib/utils';

// ── SessionTracker — pomodoro dots ───────────────────────────────────
interface SessionTrackerProps {
  sessionsCompleted: number;
  sessionsBeforeLongBreak: number;
}

export function SessionTracker({ sessionsCompleted, sessionsBeforeLongBreak }: SessionTrackerProps) {
  return (
    <div
      role="status"
      aria-label={`${sessionsCompleted} of ${sessionsBeforeLongBreak} sessions completed`}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
    >
      {Array.from({ length: sessionsBeforeLongBreak }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            width: 5,
            height: 5,
            borderRadius: 'var(--radius-full)',
            background: i < sessionsCompleted ? 'var(--color-work)' : 'var(--color-border)',
            transition: 'background var(--dur-normal) var(--ease)',
            display: 'block',
          }}
        />
      ))}
    </div>
  );
}

// ── SauceTimeline — always-visible phase list ────────────────────────
// Shows every step with label + duration.
// Active phase shows live countdown; completed phases dim out.

interface SauceTimelineProps {
  phases: readonly Phase[];
  currentPhaseIndex: number;
  isComplete: boolean;
  timeRemaining?: number; // live seconds remaining in the current phase
  isPaused?: boolean;
}

export function SauceTimeline({ phases, currentPhaseIndex, isComplete, timeRemaining, isPaused = false }: SauceTimelineProps) {
  return (
    <div
      role="status"
      aria-label={
        isComplete
          ? 'All phases complete'
          : `Step ${currentPhaseIndex + 1}: ${phases[currentPhaseIndex]?.label}`
      }
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
        width: 'fit-content',
      }}
    >
      {phases.map((phase, i) => {
        const isActive = !isComplete && i === currentPhaseIndex;
        const isDone   = isComplete || i < currentPhaseIndex;
        const displayTime = isActive && timeRemaining !== undefined
          ? formatTime(timeRemaining)
          : formatTime(phase.seconds);

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              width: '100%',
              opacity: isDone ? 0.3 : (isActive && isPaused ? 0.35 : 1),
              transition: 'opacity var(--dur-normal) var(--ease)',
            }}
          >
            {/* Dot */}
            <span
              aria-hidden="true"
              style={{
                width: 4,
                height: 4,
                borderRadius: 'var(--radius-full)',
                flexShrink: 0,
                background: isActive
                  ? 'var(--color-accent)'
                  : isDone
                  ? 'var(--color-muted)'
                  : 'var(--color-border)',
                transition: 'background var(--dur-normal) var(--ease)',
              }}
            />

            {/* Label */}
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: 'var(--tracking)',
                color: isActive ? 'var(--color-fg)' : 'var(--color-muted)',
                transition: 'color var(--dur-normal) var(--ease)',
              }}
            >
              {phase.label}
            </span>

            {/* Duration / countdown */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking)',
                color: isActive ? 'var(--color-muted-strong)' : 'var(--color-border)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color var(--dur-normal) var(--ease)',
                marginLeft: 'auto',
                paddingLeft: 'var(--space-4)',
              }}
            >
              {displayTime}
            </span>
          </div>
        );
      })}
    </div>
  );
}
