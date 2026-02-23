import { useState } from 'react';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { TimerDisplay } from '@/components/timer-display';
import { ModeIndicator } from '@/components/mode-indicator';
import { Controls } from '@/components/controls';
import { TimeSelector } from '@/components/time-selector';
import { WORK_DURATIONS, BREAK_DURATIONS } from '@/lib/constants';
import type { WorkDuration, BreakDuration } from '@/lib/types';

type Theme = 'dark' | 'light';

function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const timer = usePomodoro();

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div data-theme={theme} data-mode={timer.currentMode}>
      {/* Atmospheric bloom — sits behind everything */}
      <div className="bloom-layer" aria-hidden="true" />

      {/* Theme toggle — fixed, top-right */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* Main content column */}
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
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Timer group — mode label sits tight above the timer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-12)',
          }}
        >
          <ModeIndicator currentMode={timer.currentMode} />
          <TimerDisplay timeRemaining={timer.timeRemaining} />
        </div>

        {/* Controls */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <Controls
            isRunning={timer.isRunning}
            onToggle={timer.toggle}
            onReset={timer.reset}
            canReset={timer.canReset}
          />
        </div>

        {/* Duration selectors */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--space-12)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <TimeSelector
            label="Work"
            options={WORK_DURATIONS}
            selected={timer.workDuration}
            onChange={d => timer.setWorkDuration(d as WorkDuration)}
            disabled={timer.isRunning}
          />
          <TimeSelector
            label="Break"
            options={BREAK_DURATIONS}
            selected={timer.breakDuration}
            onChange={d => timer.setBreakDuration(d as BreakDuration)}
            disabled={timer.isRunning}
          />
        </div>
      </main>
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        position: 'fixed',
        top: 'var(--space-6)',
        right: 'var(--space-6)',
        width: 'var(--size-icon-button)',
        height: 'var(--size-icon-button)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        border: 'var(--border-width) solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        color: 'var(--color-muted)',
        transition: [
          'color var(--dur-normal) var(--ease)',
          'background var(--dur-normal) var(--ease)',
        ].join(', '),
        zIndex: 10,
      }}
      onMouseEnter={e => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--color-fg)';
        btn.style.background = 'var(--color-surface-raised)';
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--color-muted)';
        btn.style.background = 'var(--color-surface)';
      }}
      onFocus={e => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.outline = 'var(--outline-width) solid var(--color-accent)';
        btn.style.outlineOffset = 'var(--outline-offset)';
      }}
      onBlur={e => {
        (e.currentTarget as HTMLButtonElement).style.outline = 'none';
      }}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
