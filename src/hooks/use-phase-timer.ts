import { useState, useEffect, useCallback } from 'react';
import type { Phase } from '@/lib/types';
import { TICK_INTERVAL_MS } from '@/lib/constants';

export interface PhaseTimerState {
  timeRemaining: number;      // seconds left in current phase
  isRunning: boolean;
  currentPhaseIndex: number;
  currentPhase: Phase;
  isComplete: boolean;        // all phases done
  canReset: boolean;
}

export interface PhaseTimerActions {
  toggle: () => void;
  reset: () => void;
}

export function usePhaseTimer(phases: readonly Phase[]): PhaseTimerState & PhaseTimerActions {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(phases[0]?.seconds ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Reinitialise when phases array reference changes (sauce variant swap)
  useEffect(() => {
    setPhaseIndex(0);
    setTimeRemaining(phases[0]?.seconds ?? 0);
    setIsRunning(false);
    setIsComplete(false);
  }, [phases]);

  const advancePhase = useCallback(() => {
    setPhaseIndex(prev => {
      const next = prev + 1;
      if (next >= phases.length) {
        // All phases done
        setIsRunning(false);
        setIsComplete(true);
        return prev; // stay on last phase index
      }
      setTimeRemaining(phases[next].seconds);
      return next;
    });
  }, [phases]);

  // Tick
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isRunning, isComplete, advancePhase]);

  const toggle = useCallback(() => {
    if (isComplete) return;
    setIsRunning(r => !r);
  }, [isComplete]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setPhaseIndex(0);
    setTimeRemaining(phases[0]?.seconds ?? 0);
  }, [phases]);

  const currentPhase = phases[phaseIndex] ?? phases[0];
  const canReset = phaseIndex > 0 || timeRemaining !== (phases[0]?.seconds ?? 0) || isComplete;

  return {
    timeRemaining,
    isRunning,
    currentPhaseIndex: phaseIndex,
    currentPhase,
    isComplete,
    canReset,
    toggle,
    reset,
  };
}
