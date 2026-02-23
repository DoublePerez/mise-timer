import { useState, useEffect, useCallback } from 'react';
import type { Mode, WorkDuration, BreakDuration, LongBreakDuration, DeepWorkRounds } from '@/lib/types';
import type { WorkMode } from '@/lib/types';
import {
  DEFAULT_LONG_BREAK,
  TICK_INTERVAL_MS,
  WORK_MODE_CONFIGS,
  DEFAULT_DEEP_WORK_ROUNDS,
} from '@/lib/constants';
import { minutesToSeconds } from '@/lib/utils';

type BreakKind = 'short' | 'long';

// ── Custom work timer — plain countdown, any duration ────────────────
export function useCustomWorkTimer(minutes: number) {
  const total = minutesToSeconds(minutes);
  const [timeRemaining, setTimeRemaining] = useState(total);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const t = minutesToSeconds(minutes);
    setTimeRemaining(t);
    setIsRunning(false);
    setIsComplete(false);
  }, [minutes]);

  useEffect(() => {
    if (!isRunning || isComplete) return;
    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isRunning, isComplete]);

  const toggle = useCallback(() => { if (!isComplete) setIsRunning(r => !r); }, [isComplete]);
  const reset  = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeRemaining(minutesToSeconds(minutes));
  }, [minutes]);

  return {
    timeRemaining,
    isRunning,
    isComplete,
    canReset: timeRemaining !== total || isComplete,
    toggle,
    reset,
    currentMode: 'work' as Mode,
    breakKind: 'short' as BreakKind,
  } as const;
}

export function usePomodoro(
  workMode: WorkMode = 'pomodoro',
  deepWorkRounds: DeepWorkRounds = DEFAULT_DEEP_WORK_ROUNDS
) {
  const config = WORK_MODE_CONFIGS[workMode];

  const [timeRemaining, setTimeRemaining] = useState(
    minutesToSeconds(config.workDuration)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>('work');
  const [breakKind, setBreakKind] = useState<BreakKind>('short');
  const [workDuration, setWorkDurationState] = useState<WorkDuration>(config.workDuration);
  const [breakDuration, setBreakDurationState] = useState<BreakDuration>(config.breakDuration);
  const [longBreakDuration] = useState<LongBreakDuration>(DEFAULT_LONG_BREAK);

  // Completed work sessions this cycle (resets after long break / deep work cycle)
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  // Deep work: rounds completed out of the chosen total (resets after full cycle)
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Reset all state when workMode changes
  useEffect(() => {
    const cfg = WORK_MODE_CONFIGS[workMode];
    setWorkDurationState(cfg.workDuration);
    setBreakDurationState(cfg.breakDuration);
    setTimeRemaining(minutesToSeconds(cfg.workDuration));
    setIsRunning(false);
    setCurrentMode('work');
    setBreakKind('short');
    setSessionsCompleted(0);
    setRoundsCompleted(0);
  }, [workMode]);

  // Reset rounds when deepWorkRounds changes (user picked a new total)
  useEffect(() => {
    if (workMode === 'deep-work') setRoundsCompleted(0);
  }, [deepWorkRounds, workMode]);

  const canReset =
    timeRemaining !== minutesToSeconds(workDuration) || currentMode !== 'work';

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    if (currentMode === 'work') {
      if (workMode === 'deep-work') {
        // Deep work: count rounds, break after each, cycle resets when all done
        setRoundsCompleted(prev => {
          const next = prev + 1;
          if (next >= deepWorkRounds) {
            // All rounds done — reset cycle, go to break
            setTimeRemaining(minutesToSeconds(breakDuration));
            setTimeout(() => setRoundsCompleted(0), 0);
            return deepWorkRounds; // briefly show all filled before reset
          }
          setTimeRemaining(minutesToSeconds(breakDuration));
          return next;
        });
      } else {
        // Pomodoro: increment session count
        setSessionsCompleted(prev => {
          const next = prev + 1;
          const cfg = WORK_MODE_CONFIGS[workMode];
          if (cfg.longBreak !== null && next >= cfg.sessionsBeforeLongBreak) {
            setBreakKind('long');
            setTimeRemaining(minutesToSeconds(longBreakDuration));
            return 0;
          } else {
            setBreakKind('short');
            setTimeRemaining(minutesToSeconds(breakDuration));
            return next;
          }
        });
      }
      setCurrentMode('break');
    } else {
      // Break finished — back to work
      setCurrentMode('work');
      setBreakKind('short');
      setTimeRemaining(minutesToSeconds(workDuration));
      // After full deep work cycle, clear rounds
      if (workMode === 'deep-work') {
        setRoundsCompleted(prev => (prev >= deepWorkRounds ? 0 : prev));
      }
    }
  }, [currentMode, workMode, workDuration, breakDuration, longBreakDuration, deepWorkRounds]);

  // Tick
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isRunning, handleTimerComplete]);

  const toggle = useCallback(() => {
    setIsRunning(r => !r);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentMode('work');
    setBreakKind('short');
    setTimeRemaining(minutesToSeconds(workDuration));
    setSessionsCompleted(0);
    setRoundsCompleted(0);
  }, [workDuration]);

  const setWorkDuration = useCallback(
    (duration: WorkDuration) => {
      setWorkDurationState(duration);
      if (currentMode === 'work' && !isRunning) {
        setTimeRemaining(minutesToSeconds(duration));
      }
    },
    [currentMode, isRunning]
  );

  const setBreakDuration = useCallback(
    (duration: BreakDuration) => {
      setBreakDurationState(duration);
      if (currentMode === 'break' && !isRunning && breakKind === 'short') {
        setTimeRemaining(minutesToSeconds(duration));
      }
    },
    [currentMode, isRunning, breakKind]
  );

  // How many sessions before long break (for display in session tracker)
  const sessionsBeforeLongBreak = WORK_MODE_CONFIGS[workMode].sessionsBeforeLongBreak;
  const hasLongBreakCycle = WORK_MODE_CONFIGS[workMode].longBreak !== null;

  return {
    timeRemaining,
    isRunning,
    currentMode,
    breakKind,
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsCompleted,
    sessionsBeforeLongBreak,
    hasLongBreakCycle,
    roundsCompleted,
    canReset,
    toggle,
    reset,
    setWorkDuration,
    setBreakDuration,
  } as const;
}
