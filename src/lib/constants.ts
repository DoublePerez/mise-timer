import type { WorkDuration, BreakDuration } from './types';

export const WORK_DURATIONS: readonly WorkDuration[] = [5, 10, 15, 20, 25];
export const BREAK_DURATIONS: readonly BreakDuration[] = [5, 10, 15];

export const DEFAULT_WORK_DURATION: WorkDuration = 25;
export const DEFAULT_BREAK_DURATION: BreakDuration = 5;

export const SECONDS_PER_MINUTE = 60;
export const TICK_INTERVAL_MS = 1000;
