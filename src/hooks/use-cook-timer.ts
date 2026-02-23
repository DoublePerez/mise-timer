import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CookMode, PastaVariant, EggVariant, SauceVariant, Phase } from '@/lib/types';
import {
  PASTA_VARIANTS,
  EGG_VARIANTS,
  SAUCE_VARIANTS,
  DEFAULT_PASTA_VARIANT,
  DEFAULT_EGG_VARIANT,
  DEFAULT_SAUCE_VARIANT,
  SECONDS_PER_MINUTE,
  TICK_INTERVAL_MS,
} from '@/lib/constants';
import { usePhaseTimer } from './use-phase-timer';

// ── Generic single-phase countdown ──────────────────────────────────
function useSimpleTimer(totalSeconds: number) {
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setTimeRemaining(totalSeconds);
    setIsRunning(false);
    setIsComplete(false);
  }, [totalSeconds]);

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

  const toggle = useCallback(() => {
    if (isComplete) return;
    setIsRunning(r => !r);
  }, [isComplete]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeRemaining(totalSeconds);
  }, [totalSeconds]);

  return {
    timeRemaining,
    isRunning,
    isComplete,
    canReset: timeRemaining !== totalSeconds || isComplete,
    toggle,
    reset,
  };
}

// ── Pasta ────────────────────────────────────────────────────────────
function usePastaTimer(variant: PastaVariant) {
  const config = PASTA_VARIANTS.find(p => p.id === variant) ?? PASTA_VARIANTS[2];
  const timer = useSimpleTimer(config.minutes * SECONDS_PER_MINUTE);
  return { ...timer, phaseLabel: config.label };
}

// ── Egg ──────────────────────────────────────────────────────────────
function useEggTimer(variant: EggVariant) {
  const config = EGG_VARIANTS.find(e => e.id === variant) ?? EGG_VARIANTS[1];
  const timer = useSimpleTimer(config.minutes * SECONDS_PER_MINUTE);
  return { ...timer, phaseLabel: config.label };
}

// ── Sauce: sequential phases ─────────────────────────────────────────
function useSauceTimer(variant: SauceVariant) {
  const config = SAUCE_VARIANTS.find(s => s.id === variant) ?? SAUCE_VARIANTS[0];
  const phase = usePhaseTimer(config.phases);
  return {
    ...phase,
    phaseLabel: phase.currentPhase.label,
    totalPhases: config.phases.length,
    phases: config.phases,
  };
}

// ── Custom: sequential user-defined stages ────────────────────────────
const DEFAULT_CUSTOM_STAGES: Phase[] = [
  { label: 'Stage 1', seconds: 5 * SECONDS_PER_MINUTE },
];

function useCustomCookTimer(stages: readonly Phase[]) {
  const phase = usePhaseTimer(stages);
  return {
    ...phase,
    phaseLabel: phase.currentPhase.label,
    phases: stages,
  };
}

// ── Public hook ──────────────────────────────────────────────────────
export function useCookTimer() {
  const [cookMode, setCookModeState] = useState<CookMode>('pasta');
  const [pastaVariant, setPastaVariantState] = useState<PastaVariant>(DEFAULT_PASTA_VARIANT);
  const [eggVariant, setEggVariantState] = useState<EggVariant>(DEFAULT_EGG_VARIANT);
  const [sauceVariant, setSauceVariantState] = useState<SauceVariant>(DEFAULT_SAUCE_VARIANT);
  const [customCookStages, setCustomCookStages] = useState<Phase[]>(DEFAULT_CUSTOM_STAGES);

  const pasta  = usePastaTimer(pastaVariant);
  const egg    = useEggTimer(eggVariant);
  const sauce  = useSauceTimer(sauceVariant);
  // Memoize stages so the array reference only changes when content changes
  const stableStages = useMemo(() => customCookStages, [customCookStages]);
  const custom = useCustomCookTimer(stableStages);

  const setCookMode     = useCallback((m: CookMode)    => setCookModeState(m),    []);
  const setPastaVariant = useCallback((v: PastaVariant) => setPastaVariantState(v), []);
  const setEggVariant   = useCallback((v: EggVariant)   => setEggVariantState(v),   []);
  const setSauceVariant = useCallback((v: SauceVariant) => setSauceVariantState(v), []);

  const reset = useCallback(() => {
    pasta.reset();
    egg.reset();
    sauce.reset();
    custom.reset();
  }, [pasta, egg, sauce, custom]);

  const shared = {
    cookMode,
    pastaVariant,
    eggVariant,
    sauceVariant,
    customCookStages,
    setCustomCookStages,
    setCookMode,
    setPastaVariant,
    setEggVariant,
    setSauceVariant,
    // sauce phases always available for the sauce timeline display
    saucePhases: sauce.phases,
    saucePhaseIndex: sauce.currentPhaseIndex,
    // custom phases for the custom timeline display
    customPhases: custom.phases,
    customPhaseIndex: custom.currentPhaseIndex,
    reset,
  };

  if (cookMode === 'pasta') {
    return {
      ...shared,
      timeRemaining: pasta.timeRemaining,
      isRunning: pasta.isRunning,
      isComplete: pasta.isComplete,
      canReset: pasta.canReset,
      toggle: pasta.toggle,
      phaseLabel: pasta.phaseLabel,
    } as const;
  }

  if (cookMode === 'egg') {
    return {
      ...shared,
      timeRemaining: egg.timeRemaining,
      isRunning: egg.isRunning,
      isComplete: egg.isComplete,
      canReset: egg.canReset,
      toggle: egg.toggle,
      phaseLabel: egg.phaseLabel,
    } as const;
  }

  if (cookMode === 'custom') {
    return {
      ...shared,
      timeRemaining: custom.timeRemaining,
      isRunning: custom.isRunning,
      isComplete: custom.isComplete,
      canReset: custom.canReset,
      toggle: custom.toggle,
      phaseLabel: custom.phaseLabel,
    } as const;
  }

  // sauce
  return {
    ...shared,
    timeRemaining: sauce.timeRemaining,
    isRunning: sauce.isRunning,
    isComplete: sauce.isComplete,
    canReset: sauce.canReset,
    toggle: sauce.toggle,
    phaseLabel: sauce.phaseLabel,
  } as const;
}
