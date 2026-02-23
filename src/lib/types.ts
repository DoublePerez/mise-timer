export type Mode = 'work' | 'break';
export type WorkDuration = 5 | 10 | 15 | 20 | 25;
export type BreakDuration = 5 | 10 | 15;

export interface TimerState {
  timeRemaining: number; // seconds
  isRunning: boolean;
  currentMode: Mode;
  workDuration: WorkDuration;
  breakDuration: BreakDuration;
}
