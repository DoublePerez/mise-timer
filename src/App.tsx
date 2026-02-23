import { useState } from 'react';
import { TimerDisplay } from '@/components/timer-display';
import { minutesToSeconds } from '@/lib/utils';
import { DEFAULT_WORK_DURATION } from '@/lib/constants';

type Theme = 'dark' | 'light';

function App() {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div data-theme={theme} data-mode="work">
      {/* Bloom: atmospheric gradient behind all content */}
      <div className="bloom-layer" aria-hidden="true" />

      {/* Theme toggle — fixed top-right */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{
          position: 'fixed',
          top: 'var(--space-6)',
          right: 'var(--space-6)',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--color-muted)',
          transition: 'color var(--dur-normal) var(--ease), background var(--dur-normal) var(--ease)',
          zIndex: 10,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-raised)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface)';
        }}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Main content column */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          padding: 'var(--space-12) var(--space-6)',
          maxWidth: '520px',
          margin: '0 auto',
          gap: 'var(--space-8)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <TimerDisplay timeRemaining={minutesToSeconds(DEFAULT_WORK_DURATION)} />
      </main>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2.93" y1="2.93" x2="4.34" y2="4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.66" y1="11.66" x2="13.07" y2="13.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2.93" y1="13.07" x2="4.34" y2="11.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.66" y1="4.34" x2="13.07" y2="2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 100 11 6 6 0 007-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default App;
