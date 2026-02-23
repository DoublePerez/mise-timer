import { useEffect } from 'react';

interface KeyboardHandlers {
  onToggle: () => void;
  onReset: () => void;
  onSkip: (() => void) | undefined;
  canReset: boolean;
  settingsOpen: boolean;
}

export function useKeyboard({ onToggle, onReset, onSkip, canReset, settingsOpen }: KeyboardHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (settingsOpen) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onToggle();
      }
      if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey) {
        if (canReset) onReset();
      }
      if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey) {
        onSkip?.();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onToggle, onReset, onSkip, canReset, settingsOpen]);
}
