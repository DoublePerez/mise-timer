import { useState, useCallback } from 'react';
import type { TimerContext, WorkMode, CookMode, WorkDuration, BreakDuration, DeepWorkRounds } from '@/lib/types';
import { DEFAULT_DEEP_WORK_ROUNDS, PASTA_VARIANTS, EGG_VARIANTS, SAUCE_VARIANTS } from '@/lib/constants';
import { usePomodoro, useCustomWorkTimer } from '@/hooks/use-pomodoro';
import { useCookTimer } from '@/hooks/use-cook-timer';
import { TimerDisplay } from '@/components/timer-display';
import { ModeIndicator } from '@/components/mode-indicator';
import { Controls } from '@/components/controls';
import { SessionTracker, SauceTimeline } from '@/components/session-tracker';
import { SettingsPanel, SlidersIcon } from '@/components/settings-panel';

type Theme = 'dark' | 'light';

function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [context, setContext] = useState<TimerContext>('work');
  const [workMode, setWorkMode] = useState<WorkMode>('pomodoro');
  const [cookMode, setCookModeLocal] = useState<CookMode>('pasta');
  const [deepWorkRounds, setDeepWorkRounds] = useState<DeepWorkRounds>(DEFAULT_DEEP_WORK_ROUNDS);
  const [customWorkName, setCustomWorkName] = useState('Custom');
  const [customWorkMinutes, setCustomWorkMinutes] = useState(25);

  const pomodoro   = usePomodoro(workMode, deepWorkRounds);
  const customWork = useCustomWorkTimer(customWorkMinutes);
  const cook = useCookTimer();

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const openSettings  = () => setSettingsOpen(true);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  // CSS accent driven by data-mode attribute
  const dataMode = context === 'work' ? pomodoro.currentMode : 'work';

  // Label above the timer
  const modeLabel = (() => {
    if (context === 'work') {
      if (workMode === 'custom') return customWorkName;
      if (pomodoro.currentMode === 'break')
        return pomodoro.breakKind === 'long' ? 'Long Break' : 'Break';
      if (workMode === 'deep-work') return 'Deep Work';
      return 'Work';
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
      const cfg = SAUCE_VARIANTS.find(s => s.id === cook.sauceVariant);
      // During sauce, show current phase label
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

  return (
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
        onCustomWorkNameChange={setCustomWorkName}
        onCustomWorkMinutesChange={setCustomWorkMinutes}
        customCookStages={cook.customCookStages}
        onCustomCookStagesChange={cook.setCustomCookStages}
      />

      {/* Main — timer only */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          padding: 'var(--space-16) var(--space-6)',
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
        }}
      >
        {/* Mode label + timer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <ModeIndicator label={modeLabel} />
          <TimerDisplay timeRemaining={timeRemaining} />
        </div>

        {/* Tracker zone — fixed height so controls don't shift */}
        <div
          style={{
            width: '100%',
            maxWidth: 240,
            minHeight: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-8)',
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
          {context === 'cook' && cookMode === 'sauce' && (
            <SauceTimeline
              phases={saucePhases}
              currentPhaseIndex={saucePhaseIndex}
              isComplete={cook.isComplete}
              timeRemaining={cook.timeRemaining}
            />
          )}
          {context === 'cook' && cookMode === 'custom' && cook.customPhases.length > 1 && (
            <SauceTimeline
              phases={cook.customPhases}
              currentPhaseIndex={cook.customPhaseIndex}
              isComplete={cook.isComplete}
              timeRemaining={cook.timeRemaining}
            />
          )}
        </div>

        {/* Controls */}
        <Controls
          isRunning={isRunning}
          onToggle={toggle}
          onReset={reset}
          canReset={canReset}
        />
      </main>
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
        b.style.outline = 'var(--outline-width) solid var(--color-accent)';
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
        d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default App;
