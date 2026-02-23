import { useCallback } from 'react';

// Two-tone chime: a short high note followed by a lower one.
export function useAlarm() {
  const playAlarm = useCallback(() => {
    try {
      const ctx = new AudioContext();

      const play = (freq: number, startAt: number, duration: number, gain: number) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);

        env.gain.setValueAtTime(0, startAt);
        env.gain.linearRampToValueAtTime(gain, startAt + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

        osc.connect(env);
        env.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + duration);
      };

      const now = ctx.currentTime;
      play(880, now,        0.4, 0.4); // A5
      play(660, now + 0.45, 0.5, 0.3); // E5

      // Close context after sound finishes
      setTimeout(() => ctx.close(), 1200);
    } catch {
      // AudioContext not available — silent fail
    }
  }, []);

  return playAlarm;
}
