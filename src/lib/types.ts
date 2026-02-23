// ── Work context ────────────────────────────────────────────────────
export type WorkMode = 'pomodoro' | 'deep-work' | 'custom';
export type WorkDuration = 5 | 10 | 15 | 20 | 25 | 50;
export type BreakDuration = 5 | 10 | 15;
export type LongBreakDuration = 15 | 20 | 30;
export type DeepWorkRounds = 2 | 3 | 4 | 5 | 6;

// ── Cook context ────────────────────────────────────────────────────
export type CookMode = 'pasta' | 'egg' | 'sauce' | 'custom';

export type PastaVariant = 'fresh' | 'thin' | 'medium' | 'thick';
export type EggVariant = 'soft' | 'medium' | 'hard';
export type SauceVariant = 'quick' | 'slow';

// ── Shared phase type (for sequential sauce steps) ──────────────────
export interface Phase {
  label: string;      // shown in mode indicator
  seconds: number;    // duration of this phase
}

// ── Top-level context ───────────────────────────────────────────────
export type TimerContext = 'work' | 'cook';

// ── Legacy — kept so existing components that reference Mode compile ─
export type Mode = 'work' | 'break';

// ── Unified timer state ─────────────────────────────────────────────
export interface TimerState {
  timeRemaining: number;   // seconds
  isRunning: boolean;
  currentMode: Mode;       // work-context: 'work' | 'break'
  workDuration: WorkDuration;
  breakDuration: BreakDuration;
}
