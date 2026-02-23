import { useState, useEffect, useCallback } from 'react';
import type { Mode, WorkDuration, BreakDuration } from '@/lib/types';
import {
  DEFAULT_WORK_DURATION,
  DEFAULT_BREAK_DURATION,
  TICK_INTERVAL_MS,
} from '@/lib/constants';
import { minutesToSeconds } from '@/lib/utils';

export function usePomodoro() {
  const [timeRemaining, setTimeRemaining] = useState(
    minutesToSeconds(DEFAULT_WORK_DURATION)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>('work');
  const [workDuration, setWorkDurationState] = useState<WorkDuration>(DEFAULT_WORK_DURATION);
  const [breakDuration, setBreakDurationState] = useState<BreakDuration>(DEFAULT_BREAK_DURATION);

  // Derived: show reset when state differs from a fresh work timer
  const canReset =
    timeRemaining !== minutesToSeconds(workDuration) || currentMode !== 'work';

  // Mode auto-switch on completion — wrapped in useCallback to stabilize identity
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setCurrentMode(prev => {
      const next: Mode = prev === 'work' ? 'break' : 'work';
      // workDuration/breakDuration are captured via closure — safe here because
      // handleTimerComplete is recreated whenever they change
      setTimeRemaining(minutesToSeconds(next === 'work' ? workDuration : breakDuration));
      return next;
    });
  }, [workDuration, breakDuration]);

  // Tick — stale-closure-safe via functional updater
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
    setTimeRemaining(minutesToSeconds(workDuration));
  }, [workDuration]);

  const setWorkDuration = useCallback(
    (duration: WorkDuration) => {
      setWorkDurationState(duration);
      // Only reset timeRemaining if we're in work mode and not running
      if (currentMode === 'work' && !isRunning) {
        setTimeRemaining(minutesToSeconds(duration));
      }
    },
    [currentMode, isRunning]
  );

  const setBreakDuration = useCallback(
    (duration: BreakDuration) => {
      setBreakDurationState(duration);
      if (currentMode === 'break' && !isRunning) {
        setTimeRemaining(minutesToSeconds(duration));
      }
    },
    [currentMode, isRunning]
  );

  return {
    timeRemaining,
    isRunning,
    currentMode,
    workDuration,
    breakDuration,
    canReset,
    toggle,
    reset,
    setWorkDuration,
    setBreakDuration,
  } as const;
}
