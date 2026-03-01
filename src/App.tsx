import { useState, useCallback, useEffect, useRef } from 'react';
import type { TimerContext, WorkMode, CookMode, WorkDuration, BreakDuration, DeepWorkRounds } from '@/lib/types';
import { DEFAULT_DEEP_WORK_ROUNDS, PASTA_VARIANTS, EGG_VARIANTS } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useKeyboard } from '@/hooks/use-keyboard';
import { useAlarm } from '@/hooks/use-alarm';

import { usePomodoro, useCustomWorkTimer } from '@/hooks/use-pomodoro';
import { useCookTimer } from '@/hooks/use-cook-timer';
import { TimerDisplay } from '@/components/timer-display';
import { ModeIndicator } from '@/components/mode-indicator';
import { Controls } from '@/components/controls';
import { SessionTracker, SauceTimeline } from '@/components/session-tracker';
import { SettingsPanel, SlidersIcon } from '@/components/settings-panel';

type Theme = 'dark' | 'light';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  const [theme, setTheme] = useLocalStorage<Theme>('pomo:theme', 'dark');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [context, setContext] = useLocalStorage<TimerContext>('pomo:context', 'work');
  const [workMode, setWorkMode] = useLocalStorage<WorkMode>('pomo:workMode', 'pomodoro');
  const [cookMode, setCookModeLocal] = useLocalStorage<CookMode>('pomo:cookMode', 'pasta');
  const [deepWorkRounds, setDeepWorkRounds] = useLocalStorage<DeepWorkRounds>('pomo:deepWorkRounds', DEFAULT_DEEP_WORK_ROUNDS);
  const [customWorkName, setCustomWorkName] = useLocalStorage<string>('pomo:customWorkName', 'Custom');
  const [customWorkMinutes, setCustomWorkMinutes] = useLocalStorage<number>('pomo:customWorkMinutes', 25);
  const [customBreakDuration, setCustomBreakDuration] = useLocalStorage<BreakDuration>('pomo:customBreakDuration', 5);
  const [customRounds, setCustomRounds] = useLocalStorage<DeepWorkRounds>('pomo:customRounds', 3);

  // Daily session counter — resets at midnight via date-keyed storage
  const todayKey = `pomo:sessions:${new Date().toISOString().slice(0, 10)}`;
  const [dailySessions, setDailySessions] = useLocalStorage<number>(todayKey, 0);

  // 7-day history — read directly from localStorage (past 7 days including today)
  const weekHistory = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `pomo:sessions:${d.toISOString().slice(0, 10)}`;
    try { return Number(JSON.parse(localStorage.getItem(key) ?? '0')); }
    catch { return 0; }
  });

  const pomodoro   = usePomodoro(workMode, deepWorkRounds);
  const customWork = useCustomWorkTimer(customWorkMinutes, customBreakDuration, customRounds);
  const cook = useCookTimer();

  // Detect when a work session completes — increment daily counter.
  // We track the previous sessionsCompleted value; when it increases (or wraps
  // back to 0 after a long-break cycle) a session fired.
  const playAlarm = useAlarm();
  const prevPomoSessions = useRef(pomodoro.sessionsCompleted);
  const prevCustomRounds = useRef(customWork.roundsCompleted);

  // Play alarm whenever the active timer hits zero
  const prevWorkTime = useRef(pomodoro.timeRemaining);
  const prevCustomTime = useRef(customWork.timeRemaining);
  const prevCookTime = useRef(cook.timeRemaining);
  useEffect(() => {
    const t = context === 'cook' ? cook.timeRemaining
            : workMode === 'custom' ? customWork.timeRemaining
            : pomodoro.timeRemaining;
    const prev = context === 'cook' ? prevCookTime.current
               : workMode === 'custom' ? prevCustomTime.current
               : prevWorkTime.current;
    if (prev > 0 && t === 0) playAlarm();
    prevWorkTime.current = pomodoro.timeRemaining;
    prevCustomTime.current = customWork.timeRemaining;
    prevCookTime.current = cook.timeRemaining;
  }, [pomodoro.timeRemaining, customWork.timeRemaining, cook.timeRemaining, context, workMode, playAlarm]);

  useEffect(() => {
    const prev = prevPomoSessions.current;
    const curr = pomodoro.sessionsCompleted;
    // An increment OR a wrap-back (long break reset to 0 after max sessions)
    if (
      context === 'work' &&
      workMode !== 'custom' &&
      pomodoro.currentMode === 'break' &&
      (curr > prev || (prev > 0 && curr === 0))
    ) {
      setDailySessions(n => n + 1);
    }
    prevPomoSessions.current = curr;
  }, [pomodoro.sessionsCompleted, pomodoro.currentMode, context, workMode, setDailySessions]);

  useEffect(() => {
    const prev = prevCustomRounds.current;
    const curr = customWork.roundsCompleted;
    if (context === 'work' && workMode === 'custom' && customWork.currentMode === 'break' && curr > prev) {
      setDailySessions(n => n + 1);
    }
    prevCustomRounds.current = curr;
  }, [customWork.roundsCompleted, customWork.currentMode, context, workMode, setDailySessions]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const openSettings  = () => setSettingsOpen(true);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  // CSS accent driven by data-mode attribute
  const dataMode = context === 'work' ? (workMode === 'custom' ? customWork.currentMode : pomodoro.currentMode) : 'work';

  // Label above the timer
  const modeLabel = (() => {
    if (context === 'work') {
      if (workMode === 'custom')
        return customWork.currentMode === 'break' ? 'Break' : customWorkName;
      if (pomodoro.currentMode === 'break')
        return pomodoro.breakKind === 'long' ? 'Long Break' : 'Break';
      if (workMode === 'deep-work') {
        return 'Deep Work';
      }
      return 'Pomodoro';
    }
    // Cook — show variant-specific label
    if (cookMode === 'pasta') {
      const cfg = PASTA_VARIANTS.find(p => p.id === cook.pastaVariant);
      return cfg ? `${cfg.label} Pasta` : 'Pasta';
    }
    if (cookMode === 'egg') {
      const cfg = EGG_VARIANTS.find(e => e.id === cook.eggVariant);
      return cfg ? `${cfg.label} Egg` : 'Egg';
    }
    if (cookMode === 'sauce') {
      return cook.phaseLabel;
    }
    // custom cook
    return cook.phaseLabel;
  })();

  // Unified controls — route custom work through its own timer
  const activeWork = workMode === 'custom' ? customWork : pomodoro;
  const timeRemaining = context === 'work' ? activeWork.timeRemaining : cook.timeRemaining;
  const isRunning     = context === 'work' ? activeWork.isRunning     : cook.isRunning;
  const canReset      = context === 'work' ? activeWork.canReset      : cook.canReset;
  const toggle        = context === 'work' ? activeWork.toggle        : cook.toggle;
  const reset         = context === 'work' ? activeWork.reset         : cook.reset;
  const skip          = context === 'work' ? activeWork.skip          : undefined;

  // Settings handlers — reset all timers on context switch
  const handleContextChange = useCallback((ctx: TimerContext) => {
    pomodoro.reset();
    customWork.reset();
    cook.reset();
    setContext(ctx);
  }, [pomodoro, customWork, cook]);

  const handleWorkModeChange = useCallback((mode: WorkMode) => {
    setWorkMode(mode);
  }, []);

  const handleCookModeChange = useCallback((mode: CookMode) => {
    cook.setCookMode(mode);
    setCookModeLocal(mode);
  }, [cook]);

  // Sauce timeline data
  const saucePhases     = cook.saucePhases;
  const saucePhaseIndex = cook.saucePhaseIndex ?? 0;

  // Total remaining for multi-phase timers: current phase remaining + all future phases
  const sauceTotalRemaining = cook.timeRemaining +
    saucePhases.slice(saucePhaseIndex + 1).reduce((sum, p) => sum + p.seconds, 0);

  const customPhaseIndex = cook.customPhaseIndex ?? 0;
  const customTotalRemaining = cook.timeRemaining +
    cook.customPhases.slice(customPhaseIndex + 1).reduce((sum, p) => sum + p.seconds, 0);

  // Keyboard shortcuts: Space = toggle, R = reset, S = skip
  useKeyboard({ onToggle: toggle, onReset: reset, onSkip: skip, canReset, settingsOpen });

  // The big clock: show total remaining for multi-phase cook modes
  const isSauceMode   = context === 'cook' && cookMode === 'sauce';
  const isCustomMulti = context === 'cook' && cookMode === 'custom' && cook.customPhases.length > 1;
  const displayTime   = isSauceMode
    ? sauceTotalRemaining
    : isCustomMulti
    ? customTotalRemaining
    : timeRemaining;


  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <div
        data-theme={theme}
        data-mode={dataMode}
        style={{
          minHeight: '100dvh',
          background: 'var(--color-bg)',
          color: 'var(--color-fg)',
          transition: [
            'background var(--dur-slow) var(--ease)',
            'color var(--dur-slow) var(--ease)',
          ].join(', '),
        }}
      >
        {/* Fixed top-right icon cluster: theme + gear */}
        <div
          style={{
            position: 'fixed',
            top: 'var(--space-6)',
            right: 'var(--space-6)',
            display: 'flex',
            gap: 'var(--space-2)',
            zIndex: 10,
          }}
        >
          <IconButton onClick={toggleTheme} label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton onClick={openSettings} label="Open settings">
            <SlidersIcon />
          </IconButton>
        </div>

        {/* Settings overlay */}
        <SettingsPanel
          open={settingsOpen}
          onClose={closeSettings}
          context={context}
          workMode={workMode}
          cookMode={cookMode}
          onContextChange={handleContextChange}
          onWorkModeChange={handleWorkModeChange}
          onCookModeChange={handleCookModeChange}
          workDuration={pomodoro.workDuration}
          breakDuration={pomodoro.breakDuration}
          deepWorkRounds={deepWorkRounds}
          onWorkDurationChange={d => pomodoro.setWorkDuration(d as WorkDuration)}
          onBreakDurationChange={d => pomodoro.setBreakDuration(d as BreakDuration)}
          onDeepWorkRoundsChange={setDeepWorkRounds}
          pastaVariant={cook.pastaVariant}
          eggVariant={cook.eggVariant}
          sauceVariant={cook.sauceVariant}
          onPastaVariantChange={cook.setPastaVariant}
          onEggVariantChange={cook.setEggVariant}
          onSauceVariantChange={cook.setSauceVariant}
          customWorkName={customWorkName}
          customWorkMinutes={customWorkMinutes}
          customBreakDuration={customBreakDuration}
          customRounds={customRounds}
          onCustomWorkNameChange={setCustomWorkName}
          onCustomWorkMinutesChange={setCustomWorkMinutes}
          onCustomBreakDurationChange={setCustomBreakDuration}
          onCustomRoundsChange={setCustomRounds}
          customCookStages={cook.customCookStages}
          onCustomCookStagesChange={cook.setCustomCookStages}
          dailySessions={dailySessions}
          weekHistory={weekHistory}
        />

        {/* Main — full-viewport canvas, children pinned with absolute positions */}
        <main
          style={{
            position: 'relative',
            minHeight: '100dvh',
            maxWidth: 'var(--max-content-width)',
            margin: '0 auto',
          }}
        >
          {/* Zone A — Clock, pinned at --clock-anchor from top */}
          <div
            style={{
              position: 'absolute',
              top: 'var(--clock-anchor)',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)',
              width: '100%',
              padding: '0 var(--space-6)',
            }}
          >
            <ModeIndicator label={modeLabel} />
            <TimerDisplay timeRemaining={displayTime} isPaused={!isRunning && canReset} />
          </div>

          {/* Zone B — Tracker, anchored just below clock bottom */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(var(--clock-anchor) + var(--timer-half) + var(--tracker-gap))',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {context === 'work' && workMode === 'pomodoro' && pomodoro.hasLongBreakCycle && (
              <SessionTracker
                sessionsCompleted={pomodoro.sessionsCompleted}
                sessionsBeforeLongBreak={pomodoro.sessionsBeforeLongBreak}
              />
            )}
            {context === 'work' && workMode === 'deep-work' && (
              <SessionTracker
                sessionsCompleted={pomodoro.roundsCompleted}
                sessionsBeforeLongBreak={deepWorkRounds}
              />
            )}
            {context === 'work' && workMode === 'custom' && (
              <SessionTracker
                sessionsCompleted={customWork.roundsCompleted}
                sessionsBeforeLongBreak={customRounds}
              />
            )}
            {context === 'cook' && cookMode === 'sauce' && (
              <SauceTimeline
                phases={saucePhases}
                currentPhaseIndex={saucePhaseIndex}
                isComplete={cook.isComplete}
                timeRemaining={cook.timeRemaining}
                isPaused={!isRunning && canReset}
              />
            )}
            {context === 'cook' && cookMode === 'custom' && cook.customPhases.length > 1 && (
              <SauceTimeline
                phases={cook.customPhases}
                currentPhaseIndex={cook.customPhaseIndex}
                isComplete={cook.isComplete}
                timeRemaining={cook.timeRemaining}
                isPaused={!isRunning && canReset}
              />
            )}
          </div>

          {/* Zone C — Controls, pinned below tracker zone. */}
          <div
            style={{
              position: 'absolute',
              top: isSauceMode || isCustomMulti
                ? 'calc(var(--clock-anchor) + var(--timer-half) + var(--tracker-gap) + 88px + var(--space-8))'
                : 'calc(var(--clock-anchor) + var(--timer-half) + var(--tracker-gap) + 36px + var(--space-8))',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <Controls
              isRunning={isRunning}
              onToggle={toggle}
              onReset={reset}
              canReset={canReset}
            />
          </div>
        </main>
      </div>
    </>
  );
}

// ── Splash Screen ─────────────────────────────────────────────────────
// Sequence (fully automatic):
//   'in'  — name fades in at center                          0ms
//   'out' — name fades out, app revealed                    1800ms
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'hidden' | 'in' | 'out'>('hidden');

  useEffect(() => {
    const t0 = setTimeout(() => setPhase('in'),  50);
    const t1 = setTimeout(() => setPhase('out'), 1600);
    const t2 = setTimeout(() => onDone(),        2300);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0A0A0A', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 'var(--clock-anchor)',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: phase === 'in' ? 1 : 0,
          transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-timer)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#F0F0F0',
            userSelect: 'none',
          }}
        >
          mise
        </span>
      </div>
    </div>
  );
}

// ── Shared icon button ───────────────────────────────────────────────
function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      // Blur on mousedown so click never leaves a focus ring visible
      onMouseDown={e => e.preventDefault()}
      style={{
        width: 'var(--size-icon-button)',
        height: 'var(--size-icon-button)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        border: 'var(--border-width) solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        color: 'var(--color-muted)',
        transition: [
          'color var(--dur-normal) var(--ease)',
          'background var(--dur-normal) var(--ease)',
        ].join(', '),
        outline: 'none',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.color = 'var(--color-fg)';
        b.style.background = 'var(--color-surface-raised)';
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.color = 'var(--color-muted)';
        b.style.background = 'var(--color-surface)';
      }}
      onFocus={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.outline = 'var(--outline-width) solid var(--color-muted-strong)';
        b.style.outlineOffset = 'var(--outline-offset)';
      }}
      onBlur={e => {
        (e.currentTarget as HTMLButtonElement).style.outline = 'none';
      }}
    >
      {children}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.22" y1="3.22" x2="4.64" y2="4.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.36" y1="11.36" x2="12.78" y2="12.78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.22" y1="12.78" x2="4.64" y2="11.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.36" y1="4.64" x2="12.78" y2="3.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.5A5.5 5.5 0 1 0 13.5 8 4.25 4.25 0 0 1 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default App;
