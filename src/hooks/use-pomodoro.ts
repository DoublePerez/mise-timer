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

// ── Custom work timer — work/break cycles with configurable rounds ────
export function useCustomWorkTimer(
  workMinutes: number,
  breakMinutes: BreakDuration,
  rounds: DeepWorkRounds,
) {
  const [timeRemaining, setTimeRemaining] = useState(minutesToSeconds(workMinutes));
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>('work');
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Reset when any config changes
  useEffect(() => {
    setTimeRemaining(minutesToSeconds(workMinutes));
    setIsRunning(false);
    setCurrentMode('work');
    setRoundsCompleted(0);
  }, [workMinutes, breakMinutes, rounds]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (currentMode === 'work') {
      setRoundsCompleted(prev => {
        const next = prev + 1;
        if (next >= rounds) {
          // All rounds done — reset cycle
          setTimeout(() => setRoundsCompleted(0), 800);
          return next;
        }
        return next;
      });
      setTimeRemaining(minutesToSeconds(breakMinutes));
      setCurrentMode('break');
    } else {
      setTimeRemaining(minutesToSeconds(workMinutes));
      setCurrentMode('work');
    }
  }, [currentMode, workMinutes, breakMinutes, rounds]);

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

  const toggle = useCallback(() => setIsRunning(r => !r), []);
  const skip   = useCallback(() => { handleTimerComplete(); }, [handleTimerComplete]);
  const reset  = useCallback(() => {
    setIsRunning(false);
    setCurrentMode('work');
    setRoundsCompleted(0);
    setTimeRemaining(minutesToSeconds(workMinutes));
  }, [workMinutes]);

  const totalDuration = currentMode === 'work'
    ? minutesToSeconds(workMinutes)
    : minutesToSeconds(breakMinutes);

  return {
    timeRemaining,
    isRunning,
    currentMode,
    breakKind: 'short' as BreakKind,
    roundsCompleted,
    totalDuration,
    canReset: timeRemaining !== minutesToSeconds(workMinutes) || currentMode !== 'work' || roundsCompleted > 0,
    toggle,
    skip,
    reset,
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

  // Skip — immediately triggers the same logic as timer completion
  const skip = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

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
    skip,
    reset,
    setWorkDuration,
    setBreakDuration,
  } as const;
}
