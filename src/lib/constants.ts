import type {
  WorkDuration,
  BreakDuration,
  LongBreakDuration,
  DeepWorkRounds,
  WorkMode,
  CookMode,
  PastaVariant,
  EggVariant,
  SauceVariant,
  Phase,
} from './types';

// ── Shared timer constants ───────────────────────────────────────────
export const SECONDS_PER_MINUTE = 60;
export const TICK_INTERVAL_MS = 1000;

// ── Work context ────────────────────────────────────────────────────
export const WORK_DURATIONS: readonly WorkDuration[] = [5, 10, 15, 20, 25];
export const BREAK_DURATIONS: readonly BreakDuration[] = [5, 10, 15];
export const DEEP_WORK_ROUNDS: readonly DeepWorkRounds[] = [2, 3, 4, 5, 6];
export const DEFAULT_DEEP_WORK_ROUNDS: DeepWorkRounds = 3;

export const DEFAULT_WORK_DURATION: WorkDuration = 25;
export const DEFAULT_BREAK_DURATION: BreakDuration = 5;

// Sessions before a long break kicks in
export const POMODORO_SESSIONS_BEFORE_LONG_BREAK = 4;
export const DEFAULT_LONG_BREAK: LongBreakDuration = 15;

export interface WorkModeConfig {
  id: WorkMode;
  label: string;
  workDuration: WorkDuration;   // default duration
  breakDuration: BreakDuration; // default break
  longBreak: LongBreakDuration | null; // null = no long break cycle
  sessionsBeforeLongBreak: number;
}

export const WORK_MODE_CONFIGS: Record<WorkMode, WorkModeConfig> = {
  pomodoro: {
    id: 'pomodoro',
    label: 'Pomodoro',
    workDuration: 25,
    breakDuration: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: POMODORO_SESSIONS_BEFORE_LONG_BREAK,
  },
  'deep-work': {
    id: 'deep-work',
    label: 'Deep Work',
    workDuration: 50,
    breakDuration: 10,
    longBreak: null,
    sessionsBeforeLongBreak: 0,
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    workDuration: 25,
    breakDuration: 5,
    longBreak: null,
    sessionsBeforeLongBreak: 0,
  },
};

export const WORK_MODES: readonly WorkMode[] = ['pomodoro', 'deep-work', 'custom'];

// ── Cook context — Pasta ─────────────────────────────────────────────
export interface PastaVariantConfig {
  id: PastaVariant;
  label: string;
  minutes: number;
}

export const PASTA_VARIANTS: readonly PastaVariantConfig[] = [
  { id: 'fresh',  label: 'Fresh',   minutes: 3  },
  { id: 'thin',   label: 'Thin',    minutes: 8  },
  { id: 'medium', label: 'Regular', minutes: 11 },
  { id: 'thick',  label: 'Thick',   minutes: 14 },
];

export const PASTA_DESCRIPTIONS: Record<string, string> = {
  fresh:  'Fresh pasta (tagliatelle, pappardelle) — 3 min',
  thin:   'Thin dry pasta (spaghetti, linguine) — 8 min',
  medium: 'Regular dry pasta (penne, rigatoni, fusilli) — 11 min',
  thick:  'Thick dry pasta (paccheri, reginette) — 14 min',
};

export const DEFAULT_PASTA_VARIANT: PastaVariant = 'medium';

// ── Cook context — Egg ───────────────────────────────────────────────
export interface EggVariantConfig {
  id: EggVariant;
  label: string;
  minutes: number;
}

export const EGG_VARIANTS: readonly EggVariantConfig[] = [
  { id: 'soft',   label: 'Soft',  minutes: 4  },
  { id: 'medium', label: 'Jammy', minutes: 7  },
  { id: 'hard',   label: 'Hard',  minutes: 12 },
];

export const DEFAULT_EGG_VARIANT: EggVariant = 'medium';

// ── Cook context — Sauce ─────────────────────────────────────────────
// Each sauce is a sequence of phases that run automatically in order.
export interface SauceVariantConfig {
  id: SauceVariant;
  label: string;
  phases: readonly Phase[];
}

export const SAUCE_VARIANTS: readonly SauceVariantConfig[] = [
  {
    id: 'quick',
    label: 'Quick',
    phases: [
      { label: 'Soffritto',     seconds: 5  * SECONDS_PER_MINUTE }, // heat oil, onion, garlic — medium heat
      { label: 'Add tomatoes',  seconds: 2  * SECONDS_PER_MINUTE }, // crush in, season, stir
      { label: 'Simmer',        seconds: 15 * SECONDS_PER_MINUTE }, // high heat, reduce
    ],
  },
  {
    id: 'slow',
    label: 'Slow',
    phases: [
      { label: 'Soffritto',     seconds: 8  * SECONDS_PER_MINUTE }, // low heat, sweat the onion properly
      { label: 'Add tomatoes',  seconds: 2  * SECONDS_PER_MINUTE }, // crush in, season, stir
      { label: 'Simmer',        seconds: 40 * SECONDS_PER_MINUTE }, // low heat, long reduction
    ],
  },
];

export const DEFAULT_SAUCE_VARIANT: SauceVariant = 'quick';

// ── Cook context — top-level modes ───────────────────────────────────
export const COOK_MODES: readonly CookMode[] = ['pasta', 'egg', 'sauce', 'custom'];

export interface CookModeConfig {
  id: CookMode;
  label: string;
}

export const COOK_MODE_CONFIGS: Record<CookMode, CookModeConfig> = {
  pasta:  { id: 'pasta',  label: 'Pasta'  },
  egg:    { id: 'egg',    label: 'Egg'    },
  sauce:  { id: 'sauce',  label: 'Sauce'  },
  custom: { id: 'custom', label: 'Custom' },
};
